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
  FaSpinner,
  FaClipboard,
  FaShoppingCart,
  FaFlask,
  FaClock,
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
  addMonths,
  subDays,
} from "date-fns";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API } from "../../config"; // Assuming API config is correctly set up
// Components
import StatsCard from "./StatsCard";
import AppointmentsTable from "./AppointmentsTable";
import NotificationsPanel from "./NotificationPanel";
import RecentActivity from "./RecentActivity";
import InventoryStatus from "./InventoryStatus";

const Dashboard = () => {
  // State management
  const [dashboardData, setDashboardData] = useState({
    clients: [],
    patients: [],
    appointments: [],
    inventory: [],
    sales: [],
    vaccinations: [],
    medicalRecords: [],
    allMedicalRecords: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  // API endpoints - adjust these to match your backend routes
  const API_ENDPOINTS = {
    clients: `${API}clients`,
    patients: `${API}patients`,
    appointments: `${API}appointments`,
    inventory: `${API}inventory`,
    sales: `${API}sales`,
    vaccinations: `${API}vaccinations`,
    medicalRecords: `${API}medical-records`,
  };

  // Date constants
  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);
  const sevenDaysFromNow = addDays(today, 7);
  const oneMonthFromNow = addMonths(today, 1);

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [
        clientsRes,
        patientsRes,
        appointmentsRes,
        inventoryRes,
        salesRes,
        vaccinationsRes,
        medicalRecordsRes,
        allMedicalRecordRes,
      ] = await Promise.all([
        axios.get(API_ENDPOINTS.clients),
        axios.get(API_ENDPOINTS.patients),
        axios.get(`${API_ENDPOINTS.appointments}`),
        axios.get(API_ENDPOINTS.inventory),
        axios.get(API_ENDPOINTS.sales),
        axios.get(API_ENDPOINTS.vaccinations),
        axios.get(`${API_ENDPOINTS.medicalRecords}?limit=5&sort=-createdAt`),
        axios.get(API_ENDPOINTS.medicalRecords),
      ]);

      setDashboardData({
        clients: clientsRes.data || [],
        patients: patientsRes.data || [],
        appointments: appointmentsRes.data || [],
        inventory: inventoryRes.data || [],
        sales: salesRes.data || [],
        vaccinations: vaccinationsRes.data || [],
        medicalRecords: medicalRecordsRes.data || [],
        allMedicalRecords: allMedicalRecordRes.data || [],
      });

      generateNotifications({
        appointments: appointmentsRes.data || [],
        inventory: inventoryRes.data || [],
        vaccinations: vaccinationsRes.data || [],
        medicalRecords: medicalRecordsRes.data || [],
        patients: patientsRes.data || [],
      });
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      setError("Failed to load dashboard data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate notifications based on data
  const generateNotifications = ({
    appointments = [],
    inventory = [],
    vaccinations = [],
    medicalRecords = [],
    patients = [],
  }) => {
    const currentNotifications = [];

    // 1. Today's Appointments
    const todaysAppointments = appointments?.filter(
      (appt) => appt.date && isSameDay(parseISO(appt.date), today)
    );

    if (todaysAppointments.length > 0) {
      currentNotifications.push({
        type: "Today's Appointments",
        icon: <FaCalendarAlt className="text-orange-500" />,
        message: `${todaysAppointments.length} appointment${
          todaysAppointments.length > 1 ? "s" : ""
        } today.`,
        details: todaysAppointments?.map(
          (a) =>
            `${a.petName || "N/A"} (${a.clientName || "N/A"}) at ${
              a.time || "N/A"
            }`
        ),
        link: "/appointments",
        priority: 1,
      });
    }

    // 2. Expiring Inventory Items
    const expiringItems = inventory.filter((item) => {
      if (!item.expiryDate) return false;
      try {
        const expiryDate = startOfDay(parseISO(item.expiryDate));
        return (
          (isAfter(expiryDate, today) || isEqual(expiryDate, today)) &&
          isBefore(expiryDate, oneMonthFromNow)
        );
      } catch (e) {
        return false;
      }
    });

    if (expiringItems.length > 0) {
      currentNotifications.push({
        type: "Expiring Items",
        icon: <FaExclamationTriangle className="text-orange-500" />,
        message: `${expiringItems.length} item${
          expiringItems.length > 1 ? "s are" : " is"
        } expiring within 1 month.`,
        details: expiringItems.map(
          (item) =>
            `${item.name} (Exp: ${format(
              parseISO(item.expiryDate),
              "MMM dd, yyyy"
            )})`
        ),
        link: "/inventory",
        priority: 2,
      });
    }

    // 3. Expired Items
    const expiredItems = inventory.filter((item) => {
      if (!item.expiryDate) return false;
      try {
        const expiryDate = startOfDay(parseISO(item.expiryDate));
        return isBefore(expiryDate, today);
      } catch (e) {
        return false;
      }
    });

    if (expiredItems.length > 0) {
      currentNotifications.push({
        type: "Expired Items",
        icon: <FaExclamationTriangle className="text-red-500" />,
        message: `${expiredItems.length} item${
          expiredItems.length > 1 ? "s have" : " has"
        } expired!`,
        details: expiredItems.map(
          (item) =>
            `${item.name} (Exp: ${format(
              parseISO(item.expiryDate),
              "MMM dd, yyyy"
            )})`
        ),
        link: "/inventory",
        priority: 3,
      });
    }

    // 4. Upcoming Vaccinations
    const upcomingVaccinations = vaccinations.filter((vaccination) => {
      if (!vaccination.nextDueDate) return false;
      try {
        const nextDueDate = startOfDay(parseISO(vaccination.nextDueDate));
        return (
          (isAfter(nextDueDate, today) || isEqual(nextDueDate, today)) &&
          isBefore(nextDueDate, sevenDaysFromNow)
        );
      } catch (e) {
        return false;
      }
    });

    if (upcomingVaccinations.length > 0) {
      currentNotifications.push({
        type: "Upcoming Vaccinations",
        icon: <FaSyringe className="text-orange-500" />,
        message: `${upcomingVaccinations.length} vaccination${
          upcomingVaccinations.length > 1 ? "s are" : " is"
        } due soon.`,
        details: upcomingVaccinations.map(
          (v) =>
            `${v.patient?.name || "N/A"} - ${v.vaccineName} on ${format(
              parseISO(v.nextDueDate),
              "MMM dd, yyyy"
            )}`
        ),
        link: "/vaccinations",
        priority: 2,
      });
    }

    // 5. Low Inventory
    const lowInventoryItems = inventory.filter(
      (item) =>
        item.quantity !== undefined &&
        item.threshold !== undefined &&
        item.quantity <= item.threshold &&
        item.quantity > 0
    );

    if (lowInventoryItems.length > 0) {
      currentNotifications.push({
        type: "Low Inventory",
        icon: <FaBox className="text-orange-500" />,
        message: `${lowInventoryItems.length} item${
          lowInventoryItems.length > 1 ? "s are" : " is"
        } low on stock.`,
        details: lowInventoryItems.map(
          (item) => `${item.name} (${item.quantity} left)`
        ),
        link: "/inventory",
        priority: 2,
      });
    }

    // 6. Out of Stock
    const outOfStock = inventory.filter((item) => item.quantity === 0);

    if (outOfStock.length > 0) {
      currentNotifications.push({
        type: "Out of Stock",
        icon: <FaBox className="text-red-500" />,
        message: `${outOfStock.length} item${
          outOfStock.length > 1 ? "s are" : " is"
        } out of stock.`,
        details: outOfStock.map((item) => `${item.name}`),
        link: "/inventory",
        priority: 3,
      });
    }

    // 7. Upcoming Follow-ups
    const upcomingFollowUps = medicalRecords.filter((record) => {
      if (!record.followUpDate) return false;
      try {
        const followUpDate = startOfDay(parseISO(record.followUpDate));
        return (
          (isAfter(followUpDate, today) || isEqual(followUpDate, today)) &&
          isBefore(followUpDate, sevenDaysFromNow)
        );
      } catch (e) {
        return false;
      }
    });

    if (upcomingFollowUps.length > 0) {
      currentNotifications.push({
        type: "Upcoming Follow-ups",
        icon: <FaClock className="text-orange-500" />,
        message: `${upcomingFollowUps.length} follow-up${
          upcomingFollowUps.length > 1 ? "s are" : " is"
        } due within 7 days.`,
        details: upcomingFollowUps.map((record) => {
          const patient = patients.find((p) => p._id === record.patient) || {};
          return `${patient.name || "N/A"} on ${format(
            parseISO(record.followUpDate),
            "MMM dd, yyyy"
          )}`;
        }),
        link: "/patients",
        priority: 2,
      });
    }

    // Sort notifications by priority (highest first)
    currentNotifications.sort((a, b) => b.priority - a.priority);
    setNotifications(currentNotifications);
  };

  useEffect(() => {
    fetchDashboardData();
    const intervalId = setInterval(fetchDashboardData, 300000); // Refresh every 5 minutes
    return () => clearInterval(intervalId);
  }, []);

  // Calculate dashboard statistics
  const {
    clients = [],
    patients = [],
    appointments = [],
    inventory = [],
    sales = [],
    vaccinations = [],
    medicalRecords = [],
    allMedicalRecords = [],
  } = dashboardData;

  const totalClients = clients.length;
  const totalPatients = patients.length;
  const vaccinationsCompleted = vaccinations.length;
  const todaysAppointments = appointments?.filter(
    (appt) => appt.date && isSameDay(parseISO(appt.date), today)
  ).length;

  const lowInventoryItemsCount = inventory.filter(
    (item) =>
      item.quantity !== undefined &&
      item.threshold !== undefined &&
      item.quantity <= item.threshold
  ).length;
  const ongoingAppointments = allMedicalRecords.filter(
    (item) => item.treatmentCompleted === false
  );
  const monthlyRevenue = sales
    .filter(
      (s) =>
        s.date &&
        parseISO(s.date).getMonth() === today.getMonth() &&
        parseISO(s.date).getFullYear() === today.getFullYear()
    )
    .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  const yesterdayRevenue = sales
    .filter((s) => s.date && isSameDay(parseISO(s.date), yesterday))
    .reduce((sum, s) => sum + (s.totalAmount || 0), 0);

  const revenueChange = yesterdayRevenue
    ? ((monthlyRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
    : 0;

  // Stats cards configuration
  const statsCards = [
    {
      title: "Total Clients",
      value: totalClients,
      icon: <FaUserFriends className="text-orange-500 text-2xl" />,
      link: "/clients",
      trend: null,
    },
    {
      title: "Total Patients",
      value: totalPatients,
      icon: <FaPaw className="text-orange-500 text-2xl" />,
      link: "/patients",
      trend: null,
    },
    {
      title: "Today's Appointments",
      value: todaysAppointments,
      icon: <FaCalendarAlt className="text-orange-500 text-2xl" />,
      link: "/",
      trend: null,
    },
    {
      title: "Vaccinations Completed",
      value: vaccinationsCompleted,
      icon: <FaSyringe className="text-orange-500 text-2xl" />,
      link: "/vaccinations",
      trend: null,
    },
    {
      title: "Low Inventory Items",
      value: lowInventoryItemsCount,
      icon: <FaBox className="text-orange-500 text-2xl" />,
      link: "/inventory",
      trend: null,
    },
    {
      title: "Monthly Revenue",
      value: `NPR ${monthlyRevenue.toLocaleString()}`,
      icon: <FaChartLine className="text-orange-500 text-2xl" />,
      link: "/sales",
      trend: revenueChange,
    },
    {
      title: "Ongoing Treatments",
      value: ongoingAppointments.length,
      icon: <FaClipboard className="text-orange-500 text-2xl" />,
      link: "/patients",
      trend: null,
    },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white rounded-lg p-8 shadow-lg">
          <FaSpinner className="animate-spin text-4xl text-orange-500 mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-6 text-center text-red-600 bg-white rounded-lg shadow-lg">
          <p className="mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      {/* Main content container */}
      <div className="max-w-7xl mx-auto">
        {/* Header with Notifications */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-3 rounded-full bg-white shadow-md text-gray-600 hover:text-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-all"
            aria-label="Notifications"
          >
            <FaBell className="text-xl" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                {notifications.length}
              </span>
            )}
          </button>
        </div>

        {/* Notifications Panel */}
        <NotificationsPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          notifications={notifications}
        />

        {/* Dashboard Tabs */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-2">
          <nav className="flex space-x-2 sm:space-x-4">
            {["overview", "appointments", "inventory", "financial"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-2 text-sm sm:text-base font-medium rounded-lg transition-all duration-200
                    ${
                      activeTab === tab
                        ? "bg-orange-500 text-white shadow-md"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              )
            )}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {statsCards.map((stat, index) => (
                <StatsCard key={index} {...stat} />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Today's Appointments */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Today's Appointments
                    </h2>
                    <Link
                      to="/"
                      className="text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center"
                    >
                      View All
                      <span className="ml-1 text-lg">→</span>
                    </Link>
                  </div>
                  <AppointmentsTable
                    appointments={appointments?.filter(
                      (appt) =>
                        appt.date && isSameDay(parseISO(appt.date), today)
                    )}
                  />
                </div>
                {/* Ongoing Appointments */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <FaClock className="text-orange-500 mr-3 text-xl" />
                      Ongoing Treatments
                    </h2>
                    <Link
                      to="/patients"
                      className="text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center"
                    >
                      View All
                      <span className="ml-1 text-lg">→</span>
                    </Link>
                  </div>
                  {ongoingAppointments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Patient
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Start Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Diagnosis
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Veterinarian
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {ongoingAppointments.slice(0, 5).map((record) => {
                            // Check if patient is populated or just an ID
                            const patient =
                              typeof record.patient === "object" &&
                              record.patient !== null
                                ? record.patient
                                : patients.find(
                                    (p) => p._id === record.patient
                                  ) || {};

                            const patientName = patient.name || "N/A";

                            return (
                              <tr
                                key={record._id}
                                onClick={() =>
                                  navigate(
                                    `/patient/${patient._id || patient.id}`
                                  )
                                }
                                className="hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {patientName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {record.date
                                    ? format(
                                        parseISO(record.date),
                                        "MMM dd, yyyy"
                                      )
                                    : "N/A"}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                  {record.diagnosis?.[0] || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {record.veterinarian || "N/A"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No ongoing treatments found.
                    </div>
                  )}
                </div>

                {/* Upcoming Follow-up Appointments */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      <FaClock className="text-orange-500 mr-3 text-xl" />
                      Upcoming Follow-ups
                    </h2>
                    <Link
                      to="/"
                      className="text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center"
                    >
                      View All
                      <span className="ml-1 text-lg">→</span>
                    </Link>
                  </div>
                  {medicalRecords.filter((record) => record.followUpDate)
                    .length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Patient
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Follow-up Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Diagnosis
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Veterinarian
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                          {medicalRecords
                            .filter((record) => {
                              if (!record.followUpDate) return false;
                              const followUpDate = parseISO(
                                record.followUpDate
                              );
                              return (
                                isAfter(followUpDate, today) ||
                                isEqual(followUpDate, today)
                              );
                            })
                            .sort(
                              (a, b) =>
                                parseISO(a.followUpDate) -
                                parseISO(b.followUpDate)
                            )
                            .slice(0, 5)
                            .map((record) => {
                              // Check if patient is populated or just an ID
                              const patientName =
                                typeof record.patient === "object" &&
                                record.patient !== null
                                  ? record.patient.name
                                  : patients.find(
                                      (p) => p._id === record.patient
                                    )?.name || "N/A";

                              return (
                                <tr key={record._id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {patientName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {format(
                                      parseISO(record.followUpDate),
                                      "MMM dd, yyyy"
                                    )}
                                    <div className="text-xs text-gray-500">
                                      {format(
                                        parseISO(record.followUpDate),
                                        "EEEE"
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-600">
                                    {record.diagnosis?.[0] || "N/A"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {record.veterinarian}
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No upcoming follow-up appointments found.
                    </div>
                  )}
                </div>

                {/* Recent Medical Records */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6">
                  <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Recent Medical Records
                    </h2>
                    <Link
                      to="/patients"
                      className="text-sm text-orange-600 hover:text-orange-800 font-medium flex items-center"
                    >
                      View All
                      <span className="ml-1 text-lg">→</span>
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Patient
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Diagnosis
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Veterinarian
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {medicalRecords.slice(0, 5).map((record) => {
                          // Get the patient object (either directly or by finding in patients array)
                          const patient =
                            typeof record.patient === "object" &&
                            record.patient !== null
                              ? record.patient
                              : patients.find(
                                  (p) => p._id === record.patient
                                ) || {};

                          return (
                            <tr
                              key={record._id}
                              onClick={() =>
                                navigate(
                                  `/patient/${patient._id || patient.id}`
                                )
                              }
                              className="hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {patient.name || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {format(parseISO(record.date), "MMM dd, yyyy")}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {record.diagnosis?.[0] || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {record.veterinarian}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <InventoryStatus inventory={inventory} />
                <RecentActivity
                  appointments={appointments}
                  medicalRecords={medicalRecords}
                  vaccinations={vaccinations}
                />
              </div>
            </div>
          </>
        )}
        {activeTab === "appointments" && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold text-gray-900">
                Upcoming Follow-up Appointments
              </h2>
              <Link
                to="/"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md"
              >
                New Follow-up
              </Link>
            </div>
            {medicalRecords.filter((record) => record.followUpDate).length >
            0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Follow-up Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Diagnosis
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Veterinarian
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {medicalRecords
                      .filter((record) => {
                        if (!record.followUpDate) return false;
                        const followUpDate = parseISO(record.followUpDate);
                        return (
                          isAfter(followUpDate, today) ||
                          isEqual(followUpDate, today)
                        );
                      })
                      .sort(
                        (a, b) =>
                          parseISO(a.followUpDate) - parseISO(b.followUpDate)
                      )
                      .map((record) => {
                        // Check if patient is populated or just an ID
                        const patientName =
                          typeof record.patient === "object" &&
                          record.patient !== null
                            ? record.patient.name
                            : patients.find((p) => p._id === record.patient)
                                ?.name || "N/A";

                        return (
                          <tr key={record._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {patientName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {format(
                                parseISO(record.followUpDate),
                                "MMM dd, yyyy"
                              )}
                              <div className="text-xs text-gray-500">
                                {format(parseISO(record.followUpDate), "EEEE")}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {record.diagnosis?.[0] || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {record.veterinarian}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No upcoming follow-up appointments found.
              </div>
            )}
          </div>
        )}
        {activeTab === "inventory" && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold text-gray-900">
                Inventory Status
              </h2>
              <div className="flex space-x-3">
                <Link
                  to="/inventory"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md"
                >
                  Add Item
                </Link>
                <Link
                  to="/inventory"
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
                >
                  Reorder List
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Expiring Soon */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                <h3 className="font-medium text-orange-800 mb-3">
                  Expiring Soon (Next 30 Days)
                </h3>
                <ul className="space-y-2 text-gray-700">
                  {inventory
                    .filter((item) => {
                      if (!item.expiryDate) return false;
                      try {
                        const expiryDate = startOfDay(
                          parseISO(item.expiryDate)
                        );
                        return (
                          (isAfter(expiryDate, today) ||
                            isEqual(expiryDate, today)) &&
                          isBefore(expiryDate, oneMonthFromNow)
                        );
                      } catch (e) {
                        return false;
                      }
                    })
                    .slice(0, 5)
                    .map((item) => (
                      <li
                        key={item._id}
                        className="flex justify-between items-center"
                      >
                        <span>{item.name}</span>
                        <span className="text-sm text-orange-700">
                          {format(parseISO(item.expiryDate), "MMM dd, yyyy")}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Low Stock */}
              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                <h3 className="font-medium text-red-800 mb-3">
                  Low Stock Items
                </h3>
                <ul className="space-y-2 text-gray-700">
                  {inventory
                    .filter(
                      (item) =>
                        item.quantity !== undefined &&
                        item.threshold !== undefined &&
                        item.quantity <= item.threshold
                    )
                    .slice(0, 5)
                    .map((item) => (
                      <li
                        key={item._id}
                        className="flex justify-between items-center"
                      >
                        <span>{item.name}</span>
                        <span className="text-sm text-red-700">
                          {item.quantity} left (threshold: {item.threshold})
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        {activeTab === "financial" && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 md:p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold text-gray-900">
                Financial Overview
              </h2>
              <div className="flex space-x-3">
                <Link
                  to="/sales"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md"
                >
                  New Sale
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Revenue Summary */}
              <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Revenue Summary
                </h3>
                <div className="space-y-4 text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Today's Revenue</span>
                    <span className="font-medium text-gray-900">
                      NPR
                      {sales
                        .filter(
                          (s) => s.date && isSameDay(parseISO(s.date), today)
                        )
                        .reduce((sum, s) => sum + (s.totalAmount || 0), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Revenue</span>
                    <span className="font-medium text-gray-900">
                      NPR {monthlyRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Sales</span>
                    <span className="font-medium text-gray-900">
                      {sales.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Payment Methods (This Month)
                </h3>
                <div className="space-y-2 text-gray-700">
                  {["cash", "card", "online", "insurance"].map((method) => {
                    const methodSales = sales.filter(
                      (s) =>
                        s.paymentMethod === method &&
                        s.date &&
                        parseISO(s.date).getMonth() === today.getMonth() &&
                        parseISO(s.date).getFullYear() === today.getFullYear()
                    );
                    const total = methodSales.reduce(
                      (sum, s) => sum + (s.totalAmount || 0),
                      0
                    );
                    return (
                      <div key={method} className="flex justify-between">
                        <span className="capitalize text-gray-600">
                          {method}
                        </span>
                        <span className="font-medium text-gray-900">
                          NPR {total.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Sales */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Recent Sales</h3>
              <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {sales
                      .sort((a, b) => parseISO(b.date) - parseISO(a.date))
                      .slice(0, 5)
                      .map((sale) => (
                        <tr key={sale._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {format(parseISO(sale.date), "MMM dd, yyyy")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {sale.clientName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {sale.items.length} items
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            NPR {sale.totalAmount?.toLocaleString() || "0"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 capitalize">
                              {sale.paymentMethod}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
