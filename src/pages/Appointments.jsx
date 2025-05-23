import { useState, useEffect } from "react";
import AppointmentForm from "../components/AppointmentForm";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../api/appointmentService";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaPlus,
  FaChevronLeft,
  FaCalendarAlt,
  FaUser,
  FaPaw,
  FaPhoneAlt,
  FaStickyNote,
  FaUserMd,
  FaBell,
  FaExclamationTriangle,
  FaSearch,
  FaClock,
  FaCheck,
} from "react-icons/fa";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleAppointmentCreated = (newAppointment) => {
    // Update your state or refetch appointments
    console.log("New appointment created:", newAppointment);
    setShowForm(false);
  };

  useEffect(() => {
    setLoading(true);
    getAppointments()
      .then((res) => {
        setAppointments(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch appointments", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleForm = () => setShowForm((prev) => !prev);

  const handleComplete = async (id) => {
    try {
      const apptToUpdate = appointments.find((a) => a._id === id);
      if (!apptToUpdate) return;
      const updatedAppt = { ...apptToUpdate, completed: true };
      await updateAppointment(id, updatedAppt);
      setAppointments((prev) =>
        prev.map((a) => (a._id === id ? updatedAppt : a))
      );
    } catch (error) {
      console.error("Error completing appointment:", error);
    }
  };

  const handleCancel = async (id) => {
    try {
      await deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => a._id !== id));
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  // Combine date and time for proper sorting
  const getAppointmentDateTime = (appt) => {
    return new Date(`${appt.date}T${appt.time}`);
  };

  const filteredAppointments = appointments
    .filter(
      (appt) =>
        appt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.petName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((appt) => ({
      ...appt,
      dateTime: getAppointmentDateTime(appt),
    }));

  // Sort pending appointments from nearest to farthest
  const pendingAppointments = filteredAppointments
    .filter((a) => !a.completed)
    .sort((a, b) => a.dateTime - b.dateTime);

  // Sort completed appointments from most recent to oldest
  const completedAppointments = filteredAppointments
    .filter((a) => a.completed)
    .sort((a, b) => b.dateTime - a.dateTime);

  const priorityBadgeClasses = {
    Urgent: "bg-red-100 text-red-800",
    High: "bg-orange-100 text-orange-800",
    Normal: "bg-blue-100 text-blue-800",
    Low: "bg-gray-100 text-gray-800",
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const options = { weekday: "short", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Group appointments by date for better organization
  const groupAppointmentsByDate = (appointments) => {
    const grouped = {};
    appointments.forEach((appt) => {
      const dateStr = appt.date;
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(appt);
    });
    return grouped;
  };

  const groupedPendingAppointments =
    groupAppointmentsByDate(pendingAppointments);
  const groupedCompletedAppointments = groupAppointmentsByDate(
    completedAppointments
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen">
      {/* Header Section */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            {showForm && (
              <button
                onClick={toggleForm}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              >
                <FaChevronLeft className="text-gray-600 text-lg" />
              </button>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              {showForm ? "New Appointment" : "Appointment Management"}
            </h1>
          </div>

          {!showForm && (
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400 text-lg" />
                </div>
                <input
                  type="text"
                  placeholder="Search appointments..."
                  className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={toggleForm}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
              >
                <FaPlus />
                <span className="hidden sm:inline">New Appointment</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {showForm ? (
        <div className="bg-white rounded-xl shadow-md p-6">
          <AppointmentForm
            onSuccess={handleAppointmentCreated}
            onCancel={() => setShowForm(false)}
          />
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabs Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-3 font-medium text-sm sm:text-base flex items-center gap-2 relative ${
                activeTab === "pending"
                  ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaClock className="text-current" />
              Upcoming ({pendingAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-4 py-3 font-medium text-sm sm:text-base flex items-center gap-2 relative ${
                activeTab === "completed"
                  ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaCheck className="text-current" />
              Completed ({completedAppointments.length})
            </button>
          </div>

          {/* Appointment Cards */}
          <div className="space-y-8">
            {Object.entries(
              activeTab === "pending"
                ? groupedPendingAppointments
                : groupedCompletedAppointments
            ).map(([date, dateAppointments]) => (
              <div key={date} className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-700 sticky top-0 bg-white py-2 z-10">
                  {formatDate(date)}
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {dateAppointments.map((appt) => (
                    <div
                      key={appt._id}
                      className={`bg-white rounded-lg shadow-sm overflow-hidden border-l-4 ${
                        appt.completed
                          ? "border-green-500"
                          : appt.priority === "Urgent"
                          ? "border-red-500"
                          : appt.priority === "High"
                          ? "border-orange-500"
                          : "border-blue-500"
                      }`}
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                          {/* Main Info */}
                          <div className="flex-1 space-y-3">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-xl font-bold text-gray-800">
                                {appt.petName}
                                <span className="text-gray-500 font-normal ml-2">
                                  ({appt.petType})
                                </span>
                              </h3>
                              {!appt.completed && appt.priority && (
                                <span
                                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    priorityBadgeClasses[appt.priority]
                                  }`}
                                >
                                  {appt.priority}
                                </span>
                              )}
                              <span className="text-sm text-gray-500">
                                {appt.time}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              <div className="flex items-center gap-2 text-gray-600">
                                <FaUser className="text-gray-400" />
                                <span>{appt.clientName}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <FaPhoneAlt className="text-gray-400" />
                                <span>{appt.contactNumber}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <FaUserMd className="text-gray-400" />
                                <span>{appt.vetName}</span>
                              </div>
                            </div>

                            {appt.reason && (
                              <div className="flex items-start gap-2 text-gray-600">
                                <FaStickyNote className="text-gray-400 mt-1" />
                                <span>{appt.reason}</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          {!appt.completed ? (
                            <div className="flex sm:flex-col gap-2">
                              <button
                                onClick={() => handleComplete(appt._id)}
                                className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition"
                              >
                                <FaCheckCircle />
                                <span className="hidden sm:inline">
                                  Complete
                                </span>
                              </button>
                              <button
                                onClick={() => handleCancel(appt._id)}
                                className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition"
                              >
                                <FaTimesCircle />
                                <span className="hidden sm:inline">Cancel</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-green-600">
                              <FaCheckCircle />
                              <span>Completed</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredAppointments.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No appointments found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
