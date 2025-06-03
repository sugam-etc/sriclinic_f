import { useEffect, useState } from "react";
import {
  getVaccinations,
  updateVaccination,
  deleteVaccination,
  searchVaccinations,
} from "../api/vaccinationService";
import VaccinationForm from "../components/VaccinationForm.jsx";
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
} from "react-icons/fi";
import { format } from "date-fns";

export default function VaccinationPage() {
  const [vaccinations, setVaccinations] = useState([]);
  const [search, setSearch] = useState("");
  // const [tab, setTab] = useState("upcoming"); // No longer needed
  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await getVaccinations();
      // Filter out vaccinations that don't have a vaccineName (assuming these are "upcoming" without a proper administered date)
      // and sort by dateAdministered
      const completedVaccinations = res.data
        .filter((v) => v.vaccineName && v.dateAdministered) // Ensure it's a completed vaccination with a date
        .sort((a, b) => {
          const dateA = new Date(a.dateAdministered);
          const dateB = new Date(b.dateAdministered);
          return dateB.getTime() - dateA.getTime(); // Sort by most recent dateAdministered first
        });
      setVaccinations(completedVaccinations);
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
      // Only display results that are "completed" (have a vaccineName and dateAdministered)
      const completedSearchResults = res.data
        .filter((v) => v.vaccineName && v.dateAdministered)
        .sort((a, b) => {
          const dateA = new Date(a.dateAdministered);
          const dateB = new Date(b.dateAdministered);
          return dateB.getTime() - dateA.getTime(); // Sort by most recent dateAdministered first
        });
      setVaccinations(completedSearchResults);
    } catch (error) {
      console.error("Error searching vaccinations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = (vaccination) => {
    setSelectedVaccination(vaccination);
    setShowForm(true);
  };

  const handleCancel = async (id) => {
    try {
      await deleteVaccination(id);
      fetchData();
    } catch (error) {
      console.error("Error deleting vaccination:", error);
    }
  };

  const toggleExpandCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 max-w-7xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 drop-shadow-sm">
          Vaccination Records
        </h1>
        <p className="text-lg text-gray-700">
          Effortlessly manage animal vaccination history.
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
              setShowForm(true);
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-lg font-semibold"
          >
            <FiPlus size={20} />
            <span>Add New Vaccination</span>
          </button>
        </div>

        {/* Removed the tab buttons */}

        {showForm ? (
          <VaccinationForm
            existing={selectedVaccination}
            onClose={() => {
              setShowForm(false);
              fetchData();
            }}
          />
        ) : isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          </div>
        ) : vaccinations.length === 0 ? ( // Changed from filtered.length to vaccinations.length
          <div className="text-center py-20">
            <div className="text-gray-500 mb-6 text-xl">
              No vaccination records found.
            </div>
            <button
              onClick={() => {
                setSelectedVaccination(null);
                setShowForm(true);
              }}
              className="text-blue-600 hover:text-blue-800 font-bold text-lg px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Start by adding your first vaccination record!
            </button>
          </div>
        ) : (
          <div className="grid gap-5">
            {vaccinations.map(
              (
                v // Iterating directly over vaccinations now
              ) => (
                <div
                  key={v._id}
                  className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        {/* Status indicator is now always green since we only show completed */}
                        <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm"></div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {v.patientName}{" "}
                          <span className="text-gray-600 font-medium text-xl">
                            ({v.patientSpecies})
                          </span>
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-x-8 gap-y-3 text-base text-gray-700 ml-8">
                        <div className="flex items-center gap-2">
                          <FiUser className="text-gray-500 text-lg" />
                          <span>{v.ownerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FiPhone className="text-gray-500 text-lg" />
                          <span>{v.ownerPhone}</span>
                        </div>
                        {/* Display dateAdministered prominently here */}
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-gray-500 text-lg" />
                          <span className="font-semibold text-blue-700">
                            Administered: {formatDate(v.dateAdministered)}
                          </span>
                        </div>
                        {v.vaccineName && (
                          <div className="flex items-center gap-2">
                            <FiDroplet className="text-gray-500 text-lg" />
                            <span className="font-semibold">
                              {v.vaccineName}
                            </span>
                          </div>
                        )}
                      </div>

                      {expandedCard === v._id && (
                        <div className="mt-6 ml-8 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-base bg-gray-50 p-5 rounded-lg border border-gray-100">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <FiHash className="text-gray-500 text-lg" />
                              <span>
                                Patient ID:{" "}
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
                              {/* dateAdministered is already displayed prominently, but can keep it here too if needed */}
                              <div className="flex items-center gap-2">
                                <FiCalendar className="text-gray-500 text-lg" />
                                <span>
                                  Next Due:{" "}
                                  <strong className="text-gray-800">
                                    {formatDate(v.nextDueDate)}
                                  </strong>
                                </span>
                              </div>
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
                      {/* The "Complete" and "Cancel" buttons are logically for upcoming,
                        since we're only displaying completed, these can be removed.
                        If you need "Edit" or "Delete" for completed records, add them here. */}
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
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
