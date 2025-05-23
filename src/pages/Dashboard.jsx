import React, { useState, useEffect } from "react";
import {
  FaUserFriends,
  FaPaw,
  FaSyringe,
  FaCalendarAlt,
  FaBox,
  FaChartLine,
  FaBell,
  FaTimes,
  FaBars,
} from "react-icons/fa";
import {
  format,
  isSameDay,
  parseISO,
  isAfter,
  isEqual,
  startOfDay,
} from "date-fns";

// Import API services
import { getAppointments } from "../api/appointmentService.js";
import { getClients } from "../api/clientService.js";
import { getPatients } from "../api/patientService.js";
import { getAllInventory } from "../api/inventoryService.js";
import { getSales } from "../api/saleService.js";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [clientsData, setClientsData] = useState([]);
  const [patientsData, setPatientsData] = useState([]);
  const [appointmentsData, setAppointmentsData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const today = startOfDay(new Date());

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [
        clientsResponse,
        patientsResponse,
        appointmentsResponse,
        inventoryResponse,
        salesResponse,
      ] = await Promise.all([
        getClients(),
        getPatients(),
        getAppointments(),
        getAllInventory(),
        getSales(),
      ]);

      setClientsData(clientsResponse.data);
      setPatientsData(patientsResponse.data);
      setAppointmentsData(
        Array.isArray(appointmentsResponse.data)
          ? appointmentsResponse.data
          : []
      );
      setInventoryData(
        Array.isArray(inventoryResponse.data) ? inventoryResponse.data : []
      );
      setSalesData(salesResponse.data);

      const todayNotifications = [];

      // 1. Today's Appointments
      const todayAppointments = (
        Array.isArray(appointmentsResponse.data)
          ? appointmentsResponse.data
          : []
      ).filter((appt) => appt.date && isSameDay(parseISO(appt.date), today));
      if (todayAppointments.length > 0) {
        todayNotifications.push({
          type: "Appointments",
          message: `${todayAppointments.length} appointment(s) today.`,
          details: todayAppointments
            .map((a) => `${a.petName} (${a.clientName}) at ${a.time}`)
            .join(", "),
        });
      }

      // 2. Vaccinations Due Today/Soon
      const vaccinationsDueToday = (
        Array.isArray(appointmentsResponse.data)
          ? appointmentsResponse.data
          : []
      ).filter(
        (appt) =>
          appt.reason &&
          appt.reason.toLowerCase() === "vaccination" &&
          appt.date &&
          (isSameDay(parseISO(appt.date), today) ||
            isAfter(parseISO(appt.date), today))
      );

      if (vaccinationsDueToday.length > 0) {
        todayNotifications.push({
          type: "Vaccinations Due",
          message: `${vaccinationsDueToday.length} vaccination(s) due today or soon.`,
          details: vaccinationsDueToday
            .map(
              (v) =>
                `${v.petName} (${v.clientName}) on ${format(
                  parseISO(v.date),
                  "MMM dd"
                )}`
            )
            .join(", "),
        });
      }

      // 3. New Added Items
      const newAddedItems = (
        Array.isArray(inventoryResponse.data) ? inventoryResponse.data : []
      ).filter(
        (item) => item.createdAt && isSameDay(parseISO(item.createdAt), today)
      );
      if (newAddedItems.length > 0) {
        todayNotifications.push({
          type: "New Items",
          message: `${newAddedItems.length} new item(s) added today.`,
          details: newAddedItems.map((item) => item.name).join(", "),
        });
      }

      setNotifications(todayNotifications);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute dashboard stats
  const totalClients = clientsData.length;
  const totalPatients = patientsData.length;

  const vaccinationsDue = appointmentsData.filter((appt) => {
    return (
      appt.reason &&
      appt.reason.toLowerCase() === "vaccination" &&
      appt.date &&
      (isAfter(parseISO(appt.date), today) ||
        isEqual(parseISO(appt.date), today))
    );
  }).length;

  const upcomingAppointments = appointmentsData
    .filter((appt) => {
      return (
        appt.date &&
        (isAfter(parseISO(appt.date), today) ||
          isEqual(parseISO(appt.date), today)) &&
        !appt.completed
      );
    })
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .slice(0, 4);

  const threshold = 4;
  const lowInventoryItems = (
    Array.isArray(inventoryData) ? inventoryData : []
  ).filter(
    (item) => item.quantity !== undefined && item.quantity <= threshold
  ).length;

  const monthlyRevenue = salesData
    .filter(
      (s) =>
        s.date &&
        parseISO(s.date).getMonth() === today.getMonth() &&
        parseISO(s.date).getFullYear() === today.getFullYear()
    )
    .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  const stats = [
    {
      title: "Total Clients",
      value: totalClients,
      icon: <FaUserFriends className="text-indigo-500 text-2xl" />,
      link: "/clients",
    },
    {
      title: "Total Patients",
      value: totalPatients,
      icon: <FaPaw className="text-green-500 text-2xl" />,
      link: "/patients",
    },
    {
      title: "Vaccinations Due",
      value: vaccinationsDue,
      icon: <FaSyringe className="text-yellow-500 text-2xl" />,
      link: "/vaccinations",
    },
    {
      title: "Upcoming Appointments",
      value: upcomingAppointments.length,
      icon: <FaCalendarAlt className="text-blue-500 text-2xl" />,
      link: "/appointments",
    },
    {
      title: "Low Inventory Items",
      value: lowInventoryItems,
      icon: <FaBox className="text-red-500 text-2xl" />,
      link: "/inventory",
    },
    {
      title: "Monthly Revenue",
      value: `NPR  ${monthlyRevenue.toLocaleString()}`,
      icon: <FaChartLine className="text-purple-500 text-2xl" />,
      link: "/sales",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading dashboard data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        Error: {error}
        <button
          onClick={fetchDashboardData}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 relative">
      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full bg-white shadow-md text-gray-600 hover:text-indigo-600 focus:outline-none"
            aria-label="Show notifications"
          >
            <FaBell className="text-xl" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                {notifications.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-full bg-white shadow-md text-gray-600 hover:text-indigo-600 focus:outline-none"
            aria-label="Menu"
          >
            <FaBars className="text-xl" />
          </button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-3 rounded-full bg-white shadow-md text-gray-600 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Show notifications"
          >
            <FaBell className="text-2xl" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  Today's Tasks
                </h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close notifications"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif, index) => (
                    <div
                      key={index}
                      className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                    >
                      <p className="text-sm font-medium text-gray-900">
                        {notif.type}: {notif.message}
                      </p>
                      {notif.details && (
                        <p className="text-xs text-gray-500 mt-1">
                          {notif.details}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-sm text-gray-500 text-center">
                    No tasks for today!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <Link
            key={index}
            className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
            to={stat.link}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-500">
                  {stat.title}
                </p>
                <p className="mt-1 text-xl md:text-3xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className="p-2 md:p-3 rounded-full bg-gray-50">
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-100 mt-4 md:mt-6">
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h2 className="text-base md:text-lg font-semibold text-gray-800">
            Upcoming Appointments
          </h2>
          <Link
            to="/appointments"
            className="text-xs md:text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-3 py-2 md:px-6 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">
                      {appointment.petName} ({appointment.petType})
                    </td>
                    <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                      {appointment.clientName}
                    </td>
                    <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                      {appointment.date &&
                        format(parseISO(appointment.date), "MMM dd, yyyy")}{" "}
                      at {appointment.time}
                    </td>
                    <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {appointment.reason}
                      </span>
                    </td>
                    <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-right text-xs md:text-sm font-medium">
                      <Link
                        to="/appointments"
                        className="text-indigo-600 hover:text-indigo-900 mr-2 md:mr-3"
                      >
                        View
                      </Link>
                      <Link
                        className="text-green-600 hover:text-green-900"
                        to="/appointments"
                      >
                        Check In
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center px-6 py-4 text-sm text-gray-500"
                  >
                    No upcoming appointments
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div className="absolute top-0 right-0 h-full w-4/5 bg-white shadow-lg">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800">
                Today's Tasks
              </h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close notifications"
              >
                <FaTimes />
              </button>
            </div>
            <div className="h-full overflow-y-auto p-4">
              {notifications.length > 0 ? (
                notifications.map((notif, index) => (
                  <div
                    key={index}
                    className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {notif.type}: {notif.message}
                    </p>
                    {notif.details && (
                      <p className="text-xs text-gray-500 mt-1">
                        {notif.details}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-gray-500 text-center">
                  No tasks for today!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
