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
  FaExclamationTriangle,
  FaDollarSign,
} from "react-icons/fa";
import {
  format,
  isSameDay,
  parseISO,
  isAfter,
  isEqual,
  startOfDay,
  addDays,
  isBefore,
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
  // isMobileMenuOpen is not used in this snippet, but kept for context if used elsewhere
  // const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const today = startOfDay(new Date());
  const tomorrow = startOfDay(addDays(new Date(), 1));

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Make API calls
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

      // Process responses safely
      const fetchedClients = clientsResponse?.data || [];
      const fetchedPatients = patientsResponse?.data || [];
      const fetchedAppointments = Array.isArray(appointmentsResponse?.data)
        ? appointmentsResponse.data
        : [];
      const fetchedInventory = inventoryResponse;
      // const fetchedInventory = Array.isArray(inventoryResponse?.data)
      //   ? inventoryResponse.data
      //   : [];
      const fetchedSales = salesResponse?.data || [];

      // Set states
      setClientsData(fetchedClients);
      setPatientsData(fetchedPatients);
      setAppointmentsData(fetchedAppointments);
      setInventoryData(fetchedInventory);
      setSalesData(fetchedSales);

      const currentNotifications = [];
      console.log("Inv", fetchedInventory);

      // 1. Today's or Tomorrow's Appointments
      let relevantAppointments = fetchedAppointments.filter(
        (appt) => appt.date && isSameDay(parseISO(appt.date), today)
      );
      let appointmentPeriod = "today";

      if (relevantAppointments.length === 0) {
        relevantAppointments = fetchedAppointments.filter(
          (appt) => appt.date && isSameDay(parseISO(appt.date), tomorrow)
        );
        if (relevantAppointments.length > 0) {
          appointmentPeriod = "tomorrow";
        }
      }

      if (relevantAppointments.length > 0) {
        currentNotifications.push({
          type: "Appointments",
          icon: <FaCalendarAlt className="text-blue-500" />,
          message: `${relevantAppointments.length} appointment${
            relevantAppointments.length > 1 ? `s` : ""
          }  ${appointmentPeriod}.`,
          details: relevantAppointments.map(
            (a) => `${a.petName} (${a.clientName}) at ${a.time}`
          ),
        });
      }

      // 2. Expiring Items within 1 week (including today)
      const expiredItems = fetchedInventory.filter((item) => {
        if (!item.expiryDate) return false;

        try {
          const expiryDate = startOfDay(parseISO(item.expiryDate));
          if (isNaN(expiryDate.getTime())) return false;

          // Check if expiry date is before today (already expired)
          return isBefore(expiryDate, today);
        } catch (e) {
          console.warn("Invalid expiryDate format:", item.expiryDate, e);
          return false;
        }
      });

      console.log("Today's date:", today);
      console.log(
        "Items with expiry dates:",
        fetchedInventory.filter((item) => item.expiryDate)
      );

      if (expiredItems.length > 0) {
        currentNotifications.push({
          type: "Expired Items",
          icon: <FaExclamationTriangle className="text-red-500" />,
          message: `${expiredItems.length} item${
            expiredItems.length > 1 ? `s have` : ""
          }  expired already!`,
          details: expiredItems.map(
            (item) =>
              `${item.name} (Exp: ${format(
                parseISO(item.expiryDate),
                "MMM dd,yyyy"
              )})`
          ),
        });
      }

      // 4. Vaccinations Due Today or Tomorrow ONLY
      const vaccinationsDueTodayOrTomorrow = fetchedAppointments.filter(
        (appt) =>
          appt.reason &&
          appt.reason.toLowerCase().includes("vaccination") &&
          appt.date &&
          (isSameDay(parseISO(appt.date), today) ||
            isSameDay(parseISO(appt.date), tomorrow))
      );

      if (vaccinationsDueTodayOrTomorrow.length > 0) {
        currentNotifications.push({
          type: "Vaccinations Due",
          icon: <FaSyringe className="text-yellow-500" />,
          message: `${vaccinationsDueTodayOrTomorrow.length} vaccination${
            vaccinationsDueTodayOrTomorrow.length > 1 ? `s are` : " is"
          }  due today , tomorrow.`,
          details: vaccinationsDueTodayOrTomorrow.map(
            (v) =>
              `${v.petName} (${v.clientName}) on ${format(
                parseISO(v.date),
                "MMM dd"
              )} at ${v.time}` // Added time for clarity
          ),
        });
      }

      // 5. Low Inventory Items

      const lowInventoryItems = fetchedInventory.filter((item) => {
        return item.quantity <= item.threshold;
      });
      // console.log("LowInv", lowInventoryItems);

      if (lowInventoryItems.length > 0) {
        currentNotifications.push({
          type: "Low Inventory",
          icon: <FaBox className="text-red-500" />,
          message: `${lowInventoryItems.length} item${
            lowInventoryItems.length > 1 ? `s are` : " is"
          }  low on stock.`,
          details: lowInventoryItems.map(
            (item) => `${item.name} (${item.quantity} left)`
          ),
        });
      }
      // 5. Out of Stock Items

      const outOfStock = fetchedInventory.filter((item) => {
        return item.quantity == 0;
      });
      // console.log("LowInv", lowInventoryItems);

      if (outOfStock.length > 0) {
        currentNotifications.push({
          type: "Out of Stock",
          icon: <FaBox className="text-red-500" />,
          message: `${outOfStock.length} item${
            outOfStock.length > 1 ? `s are` : " is"
          } out of stock.`,
          details: outOfStock.map(
            (item) => `Name: ${item.name}, Quantity: ${item.quantity} `
          ),
        });
      }

      setNotifications(currentNotifications);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []); // Empty dependency array means this runs once on mount

  // Compute dashboard stats (kept original logic as it was good)
  const totalClients = clientsData.length;
  const totalPatients = patientsData.length;

  const vaccinationsDue = appointmentsData.filter((appt) => {
    return (
      appt.reason &&
      appt.reason.toLowerCase().includes("vaccination") &&
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

  const lowInventoryItemsCount = inventoryData.filter(
    (item) => item.quantity !== undefined && item.quantity <= item.threshold
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
      value: lowInventoryItemsCount,
      icon: <FaBox className="text-red-500 text-2xl" />,
      link: "/inventory",
    },
    {
      title: "Monthly Revenue",
      value: `NPR ${monthlyRevenue.toLocaleString()}`,
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
        <h1 className="text-xl font-bold text-gray-800">DASHBOARD</h1>
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
                  Today's Alerts
                </h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close notifications"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif, index) => (
                    <div
                      key={index}
                      className={`p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                        notif.type.includes("Expired Items") ||
                        notif.type.includes("Low Inventory")
                          ? "bg-red-50"
                          : ""
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5 mr-3">
                          {notif.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            <span
                              className={
                                notif.type.includes("Expired Items") ||
                                notif.type.includes("Low Inventory")
                                  ? "text-red-600"
                                  : ""
                              }
                            >
                              {notif.type}: {notif.message}
                            </span>
                          </p>
                          {notif.details && (
                            <div className="text-xs text-gray-500 mt-1">
                              {Array.isArray(notif.details) ? (
                                notif.details.map((detailItem, detailIndex) => (
                                  <p key={detailIndex}>{detailItem}</p>
                                ))
                              ) : (
                                <p>{notif.details}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-sm text-gray-500 text-center">
                    No alerts for today!
                  </p>
                )}
              </div>
              <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
                <Link
                  to="/inventory"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  View Inventory
                </Link>
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
                  <tr key={appointment._id || appointment.id}>
                    <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">
                      {appointment.petName} ({appointment.petType})
                    </td>
                    <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                      {appointment.clientName}
                    </td>
                    <td className="px-3 py-3 md:px-6 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-500">
                      {appointment.date &&
                        format(parseISO(appointment.date), "MMM dd,yyyy")}{" "}
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
                Today's Alerts
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
                    className={`p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                      notif.type.includes("Expired Items") ||
                      notif.type.includes("Low Inventory")
                        ? "bg-red-50"
                        : ""
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-0.5 mr-3">
                        {notif.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          <span
                            className={
                              notif.type.includes("Expired Items") ||
                              notif.type.includes("Low Inventory")
                                ? "text-red-600"
                                : ""
                            }
                          >
                            {notif.type}: {notif.message}
                          </span>
                        </p>
                        {notif.details && (
                          <div className="text-xs text-gray-500 mt-1">
                            {Array.isArray(notif.details) ? (
                              notif.details.map((detailItem, detailIndex) => (
                                <p key={detailIndex}>{detailItem}</p>
                              ))
                            ) : (
                              <p>{notif.details}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-4 text-sm text-gray-500 text-center">
                  No alerts for today!
                </p>
              )}
            </div>
            <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
              <Link
                to="/inventory"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                View Inventory
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
