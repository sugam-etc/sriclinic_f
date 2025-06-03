import { useState, useEffect } from "react";
import AppointmentForm from "../components/AppointmentForm";
import MedicalRecordForm from "../components/MedicalRecordForm"; // Import MedicalRecordForm
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from "../api/appointmentService";
import { getMedicalRecords } from "../api/medicalRecordService"; // Import medical record service
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
  FaClock,
  FaCheck,
  FaSearch,
  FaGavel, // Added FaGavel for medical records/follow-up
} from "react-icons/fa";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]); // New state for medical records
  const [activeTab, setActiveTab] = useState("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false); // State for AppointmentForm
  const [showMedicalRecordForm, setShowMedicalRecordForm] = useState(false); // State for MedicalRecordForm
  const [appointmentToConvert, setAppointmentToConvert] = useState(null); // Stores appointment data to pass to MedicalRecordForm

  // Callback function when a new appointment is created
  const handleAppointmentCreated = (newAppointment) => {
    console.log("New appointment created:", newAppointment);
    // After creation, re-fetch appointments to ensure the list is up-to-date
    // or optimistically add the new appointment if the backend returns it
    setLoading(true);
    getAppointments()
      .then((res) => {
        setAppointments(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch appointments after creation", err);
      })
      .finally(() => setLoading(false));
    setShowForm(false);
  };

  // Fetch appointments and medical records on component mount
  useEffect(() => {
    setLoading(true);
    Promise.all([getAppointments(), getMedicalRecords()]) // Fetch both
      .then(([appointmentsRes, medicalRecordsRes]) => {
        setAppointments(appointmentsRes.data);
        setMedicalRecords(medicalRecordsRes.data);
      })
      .catch((err) => {
        console.error("Failed to fetch data", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Toggle visibility of the appointment form
  const toggleForm = () => {
    setShowForm((prev) => !prev);
    setShowMedicalRecordForm(false); // Hide MedicalRecordForm if AppointmentForm is toggled
    setAppointmentToConvert(null); // Clear selected appointment
  };

  // Handle marking an appointment as complete and opening MedicalRecordForm
  const handleComplete = (id) => {
    const apptToConvert = appointments.find((a) => a._id === id);
    if (!apptToConvert) return;
    setAppointmentToConvert(apptToConvert);
    setShowMedicalRecordForm(true);
    setShowForm(false); // Hide the new appointment form if open
  };

  // Handle cancelling (deleting) an appointment
  const handleCancel = async (id) => {
    try {
      await deleteAppointment(id);
      setAppointments((prev) => prev.filter((a) => a._id !== id));
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  // Helper function to create a Date object from date and time strings for appointments
  const getAppointmentDateTime = (appt) => {
    // Assuming appt.date is 'YYYY-MM-DD' and appt.time is 'HH:MM'
    return new Date(`${appt.date}T${appt.time}`);
  };

  // Helper function to create a Date object from followUpDate string for medical records
  const getFollowUpDateTime = (record) => {
    // Assuming record.followUpDate is 'YYYY-MM-DD' or a full ISO string
    return record.followUpDate ? new Date(record.followUpDate) : null;
  };

  // Filter appointments based on search term
  const filteredAppointments = appointments
    .filter(
      (appt) =>
        appt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.petName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((appt) => ({
      ...appt,
      dateTime: getAppointmentDateTime(appt), // Add a dateTime object for sorting
    }));

  // Filter and prepare medical records for the 'Followup' tab
  const filteredFollowUpRecords = medicalRecords
    .filter((record) => {
      const followUpDate = getFollowUpDateTime(record);
      // Only include records with a followUpDate that is today or in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize today to start of day
      return (
        followUpDate &&
        followUpDate >= today &&
        (record.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.patient.species
            .toLowerCase()
            .includes(searchTerm.toLowerCase()))
      ); // Search filter for followup
    })
    .map((record) => ({
      ...record,
      dateTime: getFollowUpDateTime(record), // Add dateTime for sorting
    }));

  // Sort all filtered appointments chronologically by date and then by time
  const sortedAppointments = [...filteredAppointments].sort(
    (a, b) => a.dateTime.getTime() - b.dateTime.getTime() // Compare timestamps for accurate sorting
  );

  // Sort follow-up records chronologically by followUpDate
  const sortedFollowUpRecords = [...filteredFollowUpRecords].sort(
    (a, b) => a.dateTime.getTime() - b.dateTime.getTime()
  );

  // Filter and sort pending appointments (from nearest to farthest)
  const pendingAppointments = sortedAppointments.filter((a) => !a.completed);

  // Filter and sort completed appointments (from most recent to oldest)
  const completedAppointments = [...sortedAppointments] // Create a copy to avoid modifying sortedAppointments
    .filter((a) => a.completed)
    .reverse(); // Reverse to get most recent first

  // Tailwind CSS classes for priority badges
  const priorityBadgeClasses = {
    Urgent: "bg-red-100 text-red-800",
    High: "bg-orange-100 text-orange-800",
    Normal: "bg-blue-100 text-blue-800",
    Low: "bg-gray-100 text-gray-800",
  };

  // Format date to "Today", "Tomorrow", or "Weekday, Month Day"
  const formatDate = (dateString) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const date = new Date(dateString);
    const options = { weekday: "long", month: "long", day: "numeric" };

    // Check if date is today
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }
    // Check if date is tomorrow
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }

    return date.toLocaleDateString(undefined, options);
  };

  // Format time to AM/PM format (e.g., 9:00 AM)
  const formatTime = (timeString) => {
    // Check if timeString is a full date string (like from followUpDate)
    if (timeString && timeString.includes("T")) {
      const date = new Date(timeString);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    // Otherwise, assume it's "HH:MM"
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12; // Convert 24-hour to 12-hour format
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Group appointments by their date string (YYYY-MM-DD)
  const groupAppointmentsByDate = (appointmentsToGroup) => {
    const grouped = {};
    appointmentsToGroup.forEach((appt) => {
      const dateKey = appt.date; // Use the YYYY-MM-DD date string as the key
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(appt);
    });
    return grouped;
  };

  // Group medical records by their followUpDate string (YYYY-MM-DD)
  const groupFollowUpRecordsByDate = (recordsToGroup) => {
    const grouped = {};
    recordsToGroup.forEach((record) => {
      if (record.followUpDate) {
        const dateKey = new Date(record.followUpDate)
          .toISOString()
          .split("T")[0]; // Use YYYY-MM-DD
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(record);
      }
    });
    return grouped;
  };

  const groupedPendingAppointments =
    groupAppointmentsByDate(pendingAppointments);
  const groupedCompletedAppointments = groupAppointmentsByDate(
    completedAppointments
  );
  const groupedFollowUpRecords = groupFollowUpRecordsByDate(
    sortedFollowUpRecords
  );

  // Function to get relative date label (Today, Tomorrow, or formatted date)
  const getRelativeDateLabel = (dateString) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const date = new Date(dateString);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return formatDate(dateString);
    }
  };

  // Get and sort the date keys for rendering
  const getSortedDateKeys = (groupedItems, isCompletedTab) => {
    const dates = Object.keys(groupedItems);
    // Sort date strings chronologically for pending/followup, reverse for completed
    if (isCompletedTab) {
      return dates.sort().reverse();
    }
    return dates.sort();
  };

  const currentGroupedAppointments =
    activeTab === "pending"
      ? groupedPendingAppointments
      : activeTab === "completed"
      ? groupedCompletedAppointments
      : groupedFollowUpRecords; // For 'followup' tab
  const sortedDateKeys = getSortedDateKeys(
    currentGroupedAppointments,
    activeTab === "completed"
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto min-h-screen">
      {/* Header Section */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            {(showForm || showMedicalRecordForm) && ( // Show back button for both forms
              <button
                onClick={() => {
                  setShowForm(false);
                  setShowMedicalRecordForm(false);
                  setAppointmentToConvert(null);
                }}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              >
                <FaChevronLeft className="text-gray-600 text-lg" />
              </button>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              {showForm
                ? "New Appointment"
                : showMedicalRecordForm
                ? "New Medical Record"
                : "Appointment Management"}
            </h1>
          </div>

          {!showForm &&
            !showMedicalRecordForm && ( // Only show search and new appointment button when no form is active
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

      {showMedicalRecordForm ? (
        <div className="bg-white rounded-xl shadow-md p-6">
          <MedicalRecordForm
            appointmentData={appointmentToConvert}
            setRecords={setMedicalRecords} // Pass setRecords to update medical records list
            onCancel={() => {
              setShowMedicalRecordForm(false);
              setAppointmentToConvert(null);
            }}
            onRecordSuccess={(completedAppointmentId) => {
              // Mark the original appointment as completed after medical record is saved
              const apptToUpdate = appointments.find(
                (a) => a._id === completedAppointmentId
              );
              if (apptToUpdate) {
                const updatedAppt = { ...apptToUpdate, completed: true };
                updateAppointment(completedAppointmentId, updatedAppt)
                  .then(() => {
                    setAppointments((prev) =>
                      prev.map((a) =>
                        a._id === completedAppointmentId ? updatedAppt : a
                      )
                    );
                  })
                  .catch((err) =>
                    console.error("Failed to update appointment status:", err)
                  );
              }
              setShowMedicalRecordForm(false);
              setAppointmentToConvert(null);
            }}
          />
        </div>
      ) : showForm ? (
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
            <button
              onClick={() => setActiveTab("followup")}
              className={`px-4 py-3 font-medium text-sm sm:text-base flex items-center gap-2 relative ${
                activeTab === "followup"
                  ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FaGavel className="text-current" /> {/* Icon for Followup */}
              Followup ({sortedFollowUpRecords.length})
            </button>
          </div>

          {/* Content based on active tab */}
          <div className="space-y-8">
            {sortedDateKeys.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No {activeTab} records found.
              </div>
            )}
            {sortedDateKeys.map((date) => {
              const dateItems = currentGroupedAppointments[date];
              return (
                <div key={date} className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-700 sticky top-0 bg-white py-2 z-10">
                    {getRelativeDateLabel(date)}
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {dateItems.map((item) => (
                      <div
                        key={item._id}
                        className={`bg-white rounded-lg shadow-sm overflow-hidden border-l-4 ${
                          activeTab === "followup"
                            ? "border-purple-500" // Distinct border for followup
                            : item.completed
                            ? "border-green-500"
                            : item.priority === "Urgent"
                            ? "border-red-500"
                            : item.priority === "High"
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
                                  {activeTab === "followup"
                                    ? item.patient.name // Pet Name for followup
                                    : item.petName}
                                  <span className="text-gray-500 font-normal ml-2">
                                    (
                                    {activeTab === "followup"
                                      ? item.patient.species // Pet Type for followup
                                      : item.petType}
                                    {activeTab !== "followup" &&
                                      item.petAge &&
                                      `, ${item.petAge}`}
                                    )
                                  </span>
                                </h3>
                                {activeTab !== "followup" &&
                                  !item.completed &&
                                  item.priority && (
                                    <span
                                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                                        priorityBadgeClasses[item.priority]
                                      }`}
                                    >
                                      {item.priority}
                                    </span>
                                  )}
                                <div className="flex items-center gap-1 text-gray-600">
                                  <FaCalendarAlt className="text-gray-400" />
                                  <span>
                                    {activeTab === "followup"
                                      ? formatTime(item.followUpDate) // Use followUpDate for time
                                      : formatTime(item.time)}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                <div className="flex items-center gap-2 text-gray-600">
                                  <FaUser className="text-gray-400" />
                                  <span>
                                    {activeTab === "followup"
                                      ? item.patient.ownerName // Owner Name for followup
                                      : item.clientName}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <FaPhoneAlt className="text-gray-400" />
                                  <span>
                                    {activeTab === "followup"
                                      ? item.patient.ownerContact // Owner Contact for followup
                                      : item.contactNumber}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                  <FaUserMd className="text-gray-400" />
                                  <span>
                                    {item.vetenarian || item.vetName}
                                  </span>{" "}
                                  {/* Vetenarian/Vet Name */}
                                </div>
                                {activeTab === "followup" && item.diagnosis && (
                                  <div className="flex items-start gap-2 text-gray-600 col-span-full">
                                    <FaStickyNote className="text-gray-400 mt-1" />
                                    <span>Diagnosis: {item.diagnosis}</span>
                                  </div>
                                )}
                                {activeTab === "followup" && item.notes && (
                                  <div className="flex items-start gap-2 text-gray-600 col-span-full">
                                    <FaStickyNote className="text-gray-400 mt-1" />
                                    <span>Notes: {item.notes}</span>
                                  </div>
                                )}
                                {activeTab !== "followup" && item.reason && (
                                  <div className="flex items-start gap-2 text-gray-600 col-span-full">
                                    <FaStickyNote className="text-gray-400 mt-1" />
                                    <span>Reason: {item.reason}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions (only for appointments) */}
                            {activeTab !== "followup" &&
                              (!item.completed ? (
                                <div className="flex sm:flex-col gap-2">
                                  <button
                                    onClick={() => handleComplete(item._id)}
                                    className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition"
                                  >
                                    <FaCheckCircle />
                                    <span className="hidden sm:inline">
                                      Complete
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => handleCancel(item._id)}
                                    className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition"
                                  >
                                    <FaTimesCircle />
                                    <span className="hidden sm:inline">
                                      Cancel
                                    </span>
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-green-600">
                                  <FaCheckCircle />
                                  <span>Completed</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
