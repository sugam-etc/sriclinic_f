// pages/VaccinationPage.jsx
import { useEffect, useState } from "react";
import {
  getVaccinations,
  deleteVaccination,
  searchVaccinations,
} from "../api/vaccinationService"; // Correct path
import VaccinationForm from "../components/VaccinationForm.jsx"; // Correct path
import {
  FiSearch,
  FiPlus,
  FiCheck,
  FiX,
  FiCalendar,
  FiPhone,
  FiUser,
  FiInfo,
  FiDroplet,
  FiClipboard,
  FiHash,
  FiPackage,
  FiChevronDown,
  FiChevronUp,
  FiEdit, // Added for edit button
  FiTrash, // Added for delete button
} from "react-icons/fi";
import { format } from "date-fns";

export default function VaccinationPage() {
  const [allVaccinations, setAllVaccinations] = useState([]); // Store all fetched vaccinations
  const [upcomingVaccinations, setUpcomingVaccinations] = useState([]);
  const [completedVaccinations, setCompletedVaccinations] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming"); // 'upcoming' or 'completed'
  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);
  const [isCompletingAppointment, setIsCompletingAppointment] = useState(false); // New state for completion flow

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await getVaccinations();
      const fetchedVaccinations = res.data;

      // Filter and sort into upcoming and completed based on the 'status' field
      const upcoming = fetchedVaccinations
        .filter((v) => v.status === "upcoming")
        .sort((a, b) => {
          const dateA = a.nextDueDate
            ? new Date(a.nextDueDate)
            : new Date(8640000000000000); // Max date if no due date
          const dateB = b.nextDueDate
            ? new Date(b.nextDueDate)
            : new Date(8640000000000000);
          return dateA.getTime() - dateB.getTime(); // Sort upcoming by next due date (earliest first)
        });

      const completed = fetchedVaccinations
        .filter((v) => v.status === "completed")
        .sort((a, b) => {
          const dateA = new Date(a.dateAdministered);
          const dateB = new Date(b.dateAdministered);
          return dateB.getTime() - dateA.getTime(); // Sort completed by most recent dateAdministered first
        });

      setAllVaccinations(fetchedVaccinations); // Keep all for search
      setUpcomingVaccinations(upcoming);
      setCompletedVaccinations(completed);
    } catch (error) {
      console.error("Error fetching vaccinations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const res = await searchVaccinations({ patientName: search });
      const searchResults = res.data;

      // Filter search results into upcoming and completed based on the 'status' field
      const upcoming = searchResults
        .filter((v) => v.status === "upcoming")
        .sort((a, b) => {
          const dateA = a.nextDueDate
            ? new Date(a.nextDueDate)
            : new Date(8640000000000000);
          const dateB = b.nextDueDate
            ? new Date(b.nextDueDate)
            : new Date(8640000000000000);
          return dateA.getTime() - dateB.getTime();
        });

      const completed = searchResults
        .filter((v) => v.status === "completed")
        .sort((a, b) => {
          const dateA = new Date(a.dateAdministered);
          const dateB = new Date(b.dateAdministered);
          return dateB.getTime() - dateA.getTime();
        });

      setUpcomingVaccinations(upcoming);
      setCompletedVaccinations(completed);
    } catch (error) {
      console.error("Error searching vaccinations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteAppointment = (vaccination) => {
    setSelectedVaccination(vaccination);
    setIsCompletingAppointment(true); // Indicate that we are completing an appointment
    setShowForm(true);
  };

  const handleEdit = (vaccination) => {
    setSelectedVaccination(vaccination);
    setIsCompletingAppointment(false); // Not completing, just editing
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    // Implement a confirmation dialog here instead of direct delete
    // Using a simple window.confirm as per instructions, but a custom modal is recommended for production.
    if (
      window.confirm("Are you sure you want to delete this vaccination record?")
    ) {
      try {
        await deleteVaccination(id);
        fetchData(); // Refresh data after deletion
      } catch (error) {
        console.error("Error deleting vaccination:", error);
      }
    }
  };

  const toggleExpandCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      console.error("Invalid date string:", dateString);
      return "Invalid Date";
    }
  };

  useEffect(() => {
    fetchData(); // Initial data fetch on component mount
  }, []);

  const displayedVaccinations =
    activeTab === "upcoming" ? upcomingVaccinations : completedVaccinations;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 max-w-7xl mx-auto font-sans">
      <style>
        {`
          .input {
            @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200;
          }
        `}
      </style>
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 drop-shadow-sm">
          Vaccination Records
        </h1>
        <p className="text-lg text-gray-700">
          Effortlessly manage animal vaccination history and upcoming
          appointments.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400 text-lg" />
            </div>
            <input
              type="text"
              placeholder="Search by patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 placeholder-gray-500 text-gray-800"
            />
          </div>
          <button
            onClick={() => {
              setSelectedVaccination(null);
              setIsCompletingAppointment(false); // New appointment is not a completion
              setShowForm(true);
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-lg font-semibold"
          >
            <FiPlus size={20} />
            <span>Book New Appointment</span>
          </button>
        </div>

        {/* Tab buttons for Upcoming and Completed */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-6 py-3 text-lg font-medium rounded-t-lg transition-colors duration-200 ${
              activeTab === "upcoming"
                ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming Appointments ({upcomingVaccinations.length})
          </button>
          <button
            className={`px-6 py-3 text-lg font-medium rounded-t-lg transition-colors duration-200 ${
              activeTab === "completed"
                ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            Completed Vaccinations ({completedVaccinations.length})
          </button>
        </div>

        {showForm ? (
          <VaccinationForm
            existing={selectedVaccination}
            onClose={() => {
              setShowForm(false);
              setSelectedVaccination(null);
              setIsCompletingAppointment(false);
              fetchData(); // Re-fetch data to update lists after form submission
            }}
            isCompletingAppointment={isCompletingAppointment}
          />
        ) : isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : displayedVaccinations.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-500 mb-6 text-xl">
              No{" "}
              {activeTab === "upcoming"
                ? "upcoming appointments"
                : "completed vaccination records"}{" "}
              found.
            </div>
            {activeTab === "upcoming" && (
              <button
                onClick={() => {
                  setSelectedVaccination(null);
                  setIsCompletingAppointment(false);
                  setShowForm(true);
                }}
                className="text-blue-600 hover:text-blue-800 font-bold text-lg px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Book your first appointment!
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5">
            {displayedVaccinations.map((v) => (
              <div
                key={v._id}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      {/* Status indicator */}
                      <div
                        className={`w-4 h-4 rounded-full ${
                          v.status === "completed"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        } shadow-sm`}
                      ></div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {v.patientName || "N/A"}{" "}
                        <span className="text-gray-600 font-medium text-xl">
                          ({v.patientSpecies || "N/A"})
                        </span>
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-x-8 gap-y-3 text-base text-gray-700 ml-8">
                      <div className="flex items-center gap-2">
                        <FiUser className="text-gray-500 text-lg" />
                        <span>{v.ownerName || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiPhone className="text-gray-500 text-lg" />
                        <span>{v.ownerPhone || "N/A"}</span>
                      </div>
                      {v.status === "completed" && (
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-gray-500 text-lg" />
                          <span className="font-semibold text-blue-700">
                            Administered: {formatDate(v.dateAdministered)}
                          </span>
                        </div>
                      )}
                      {v.status === "upcoming" && v.nextDueDate && (
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-gray-500 text-lg" />
                          <span className="font-semibold text-orange-700">
                            Due: {formatDate(v.nextDueDate)}
                          </span>
                        </div>
                      )}
                      {v.vaccineName && (
                        <div className="flex items-center gap-2">
                          <FiDroplet className="text-gray-500 text-lg" />
                          <span className="font-semibold">{v.vaccineName}</span>
                        </div>
                      )}
                    </div>

                    {expandedCard === v._id && (
                      <div className="mt-6 ml-8 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-base bg-gray-50 p-5 rounded-lg border border-gray-100">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <FiHash className="text-gray-500 text-lg" />
                            <span>
                              Pet ID:{" "}
                              <strong className="text-gray-800">
                                {v.patientId || "N/A"}
                              </strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiInfo className="text-gray-500 text-lg" />
                            <span>
                              Breed:{" "}
                              <strong className="text-gray-800">
                                {v.patientBreed || "N/A"}
                              </strong>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiCalendar className="text-gray-500 text-lg" />
                            <span>
                              Age:{" "}
                              <strong className="text-gray-800">
                                {v.patientAge || "N/A"}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {v.vaccineName && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <FiPackage className="text-gray-500 text-lg" />
                              <span>
                                Manufacturer:{" "}
                                <strong className="text-gray-800">
                                  {v.manufacturer || "N/A"}
                                </strong>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FiHash className="text-gray-500 text-lg" />
                              <span>
                                Batch:{" "}
                                <strong className="text-gray-800">
                                  {v.batchNumber || "N/A"}
                                </strong>
                              </span>
                            </div>
                          </div>
                        )}

                        {v.notes && (
                          <div className="md:col-span-2 bg-gray-100 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2 text-gray-700 mb-2">
                              <FiClipboard className="text-gray-500 text-lg" />
                              <span className="font-semibold">Notes:</span>
                            </div>
                            <p className="text-gray-800 pl-7">{v.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 md:gap-2">
                    {activeTab === "upcoming" && (
                      <>
                        <button
                          onClick={() => handleCompleteAppointment(v)}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <FiCheck size={18} />
                          <span>Complete</span>
                        </button>
                        <button
                          onClick={() => handleDelete(v._id)}
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <FiX size={18} />
                          <span>Cancel</span>
                        </button>
                      </>
                    )}
                    {activeTab === "completed" && (
                      <>
                        <button
                          onClick={() => handleEdit(v)}
                          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <FiEdit size={18} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(v._id)}
                          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <FiTrash size={18} />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => toggleExpandCard(v._id)}
                      className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      {expandedCard === v._id ? (
                        <>
                          <FiChevronUp size={18} />
                          <span>Less Details</span>
                        </>
                      ) : (
                        <>
                          <FiChevronDown size={18} />
                          <span>More Details</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
