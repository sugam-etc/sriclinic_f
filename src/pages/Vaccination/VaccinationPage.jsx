import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { vaccinationService } from "../../api/vaccinationService.js";
import VaccinationForm from "../../components/VaccinationForm.jsx";
import {
  FiSearch,
  FiPlus,
  FiEdit,
  FiTrash,
  FiInfo,
  FiUser,
  FiPhone,
  FiCalendar,
  FiDroplet,
} from "react-icons/fi";
import { format } from "date-fns";
import { clientService } from "../../api/clientService.js";
import { patientService } from "../../api/patientService.js";

export default function VaccinationPage() {
  const navigate = useNavigate();
  const [allVaccinations, setAllVaccinations] = useState([]);
  const [completedVaccinations, setCompletedVaccinations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // First fetch all clients
      const clients = await clientService.getClients();

      // Then get all patients from these clients with client details
      const allPatients = [];
      for (const client of clients) {
        const patients = await patientService.getPatientsByClient(client._id);
        const patientsWithClient = patients.map((patient) => ({
          ...patient,
          client: {
            // Ensure client details are included
            _id: client._id,
            name: client.owner,
            phone: client.contact,
            email: client.email,
            address: client.address,
          },
        }));
        allPatients.push(...patientsWithClient);
      }

      // Filter patients with vaccination history
      const patientsWithVaccinations = allPatients.filter(
        (patient) =>
          patient.vaccinationHistory && patient.vaccinationHistory.length > 0
      );

      // Fetch detailed vaccination records for these patients
      const vaccinationDetails = await Promise.all(
        patientsWithVaccinations.map(async (patient) => {
          const res = await vaccinationService.getVaccinationsByPatient(
            patient._id
          );
          console.log(res);
          return {
            patient,
            vaccinations: res.vaccinations || [],
          };
        })
      );

      // Flatten the structure for table display
      const fetchedVaccinations = vaccinationDetails.flatMap(
        ({ patient, vaccinations }) =>
          vaccinations.map((vaccination) => ({
            ...vaccination,
            _id: vaccination._id,
            patientId: patient._id,
            patientName: patient.name,
            patientSpecies: patient.species,
            patientBreed: patient.breed,
            patientAge: patient.age,
            ownerName: patient.client?.name || patient.client?.owner || "N/A",
            ownerPhone:
              patient.client?.phone || patient.client?.contact || "N/A",
            dateAdministered: vaccination.dateAdministered,
            vaccineName: vaccination.vaccineName,
          }))
      );

      // Sort by date
      const completed = [...fetchedVaccinations].sort((a, b) => {
        const dateA = new Date(a.dateAdministered);
        const dateB = new Date(b.dateAdministered);
        return dateB.getTime() - dateA.getTime();
      });

      setAllVaccinations(fetchedVaccinations);
      setCompletedVaccinations(completed);
    } catch (error) {
      setError("Failed to load vaccination data. Please try again.");
      console.error("Error fetching vaccinations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const res = await vaccinationService.searchVaccinations({
        patientName: searchTerm,
      });

      const searchResults = res.map((vaccination) => ({
        ...vaccination,
        patientName: vaccination.patient?.name,
        patientSpecies: vaccination.patient?.species,
        patientBreed: vaccination.patient?.breed,
        patientAge: vaccination.patient?.age,
        ownerName: vaccination.patient?.client?.name || "N/A",
        ownerPhone: vaccination.patient?.client?.phone || "N/A",
        patientId: vaccination.patient?._id,
      }));

      const completed = [...searchResults].sort((a, b) => {
        const dateA = new Date(a.dateAdministered);
        const dateB = new Date(b.dateAdministered);
        return dateB.getTime() - dateA.getTime();
      });

      setCompletedVaccinations(completed);
    } catch (error) {
      setError("Failed to search vaccinations. Please try again.");
      console.error("Error searching vaccinations:", error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the component remains the same ...
  const handleEdit = (vaccination) => {
    setSelectedVaccination(vaccination);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this vaccination record?")
    ) {
      try {
        await vaccinationService.deleteVaccination(id);
        fetchData();
      } catch (error) {
        setError("Failed to delete vaccination. Please try again.");
        console.error("Error deleting vaccination:", error);
      }
    }
  };

  const handleViewDetails = (patientId) => {
    if (!patientId) {
      console.error("No patientId provided");
      return;
    }
    navigate(`/vaccination-details/${patientId}`);
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
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-inter p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Vaccination Records
            </h1>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400 text-lg" />
              </div>
              <input
                type="text"
                placeholder="Search by patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 text-base"
              />
            </div>
            {/* <button
              onClick={() => {
                setSelectedVaccination(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-xl shadow-md hover:bg-orange-600 transition duration-200 text-base font-semibold w-full sm:w-auto justify-center"
            >
              <FiPlus className="text-lg" /> Add Vaccination
            </button> */}
          </div>
        </div>

        {showForm ? (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <VaccinationForm
                patientId={selectedVaccination?.patientId} // Pass patientId for existing records
                existing={selectedVaccination}
                onSave={() => {
                  setShowForm(false);
                  setSelectedVaccination(null);
                  fetchData(); // Re-fetch data to update the list
                }}
                onCancel={() => {
                  setShowForm(false);
                  setSelectedVaccination(null);
                }}
              />
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-3xl shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : completedVaccinations.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
            <div className="text-gray-500 mb-6 text-lg">
              No vaccination records found.
            </div>
            <button
              onClick={() => {
                setSelectedVaccination(null);
                setShowForm(true);
              }}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition duration-200 text-base font-semibold"
            >
              Add First Vaccination
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Patient",
                      "Owner",
                      "Contact",
                      "Vaccine",
                      "Date",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {completedVaccinations.map((v) => (
                    <tr
                      key={v._id}
                      className="hover:bg-gray-50 transition duration-150 ease-in-out cursor-pointer"
                      onClick={() => handleViewDetails(v.patientId)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <FiUser className="text-orange-600 text-lg" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {v.patientName || "N/A"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {v.patientSpecies || "N/A"} •{" "}
                              {v.patientBreed || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {v.ownerName || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {v.ownerPhone || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        <div className="flex items-center gap-2">
                          <FiDroplet className="text-blue-500 text-lg" />
                          <span>{v.vaccineName || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        <div className="flex items-center gap-2">
                          <FiCalendar className="text-green-500 text-lg" />
                          <span>{formatDate(v.dateAdministered)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(v);
                            }}
                            className="text-gray-600 hover:text-orange-500 p-2 rounded-full hover:bg-gray-200 transition duration-200"
                            title="Edit"
                          >
                            <FiEdit className="text-lg" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(v._id);
                            }}
                            className="text-gray-600 hover:text-red-500 p-2 rounded-full hover:bg-gray-200 transition duration-200"
                            title="Delete"
                          >
                            <FiTrash className="text-lg" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(v.patientId);
                            }}
                            className="text-gray-600 hover:text-blue-500 p-2 rounded-full hover:bg-gray-200 transition duration-200"
                            title="View Details"
                          >
                            <FiInfo className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
