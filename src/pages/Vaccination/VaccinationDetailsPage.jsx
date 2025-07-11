import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { vaccinationService } from "../../api/vaccinationService";
import { patientService } from "../../api/patientService";
import {
  FiArrowLeft,
  FiCalendar,
  FiPhone,
  FiUser,
  FiInfo,
  FiDroplet,
  FiClipboard,
  FiHash,
  FiPackage,
  FiPlus,
  FiEdit,
  FiTrash,
  FiChevronRight,
} from "react-icons/fi";
import { format } from "date-fns";
import VaccinationForm from "../../components/VaccinationForm";

export default function VaccinationDetailsPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [vaccinations, setVaccinations] = useState([]);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch patient data - handle both direct response and axios response structure
        const patientResponse = await patientService.getPatientById(patientId);
        const patientData = patientResponse.data || patientResponse; // Handle both axios and direct responses

        if (!patientData) {
          throw new Error("Patient not found");
        }

        // Ensure we have the patient object
        const patient = patientData.data ? patientData.data : patientData;

        if (!patient) {
          throw new Error("Patient data is invalid");
        }

        setPatient({
          ...patient,
          ownerName: patient.client?.name || patient.client?.owner || "N/A",
          ownerContact:
            patient.client?.phone || patient.client?.contact || "N/A",
        });

        // Fetch vaccinations
        const vaccinationResponse =
          await vaccinationService.getVaccinationsByPatient(patientId);
        const vaccinationData = vaccinationResponse.data || vaccinationResponse;

        let processedVaccinations = [];
        if (Array.isArray(vaccinationData)) {
          processedVaccinations = vaccinationData;
        } else if (vaccinationData?.vaccinations) {
          processedVaccinations = vaccinationData.vaccinations;
        } else if (vaccinationData && typeof vaccinationData === "object") {
          processedVaccinations = [vaccinationData];
        }

        setVaccinations(processedVaccinations);
      } catch (error) {
        console.error("Full error object:", error);
        setError(error.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [patientId, showForm]);

  const handleAddNew = () => {
    setSelectedVaccination(null);
    setShowForm(true);
  };

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
        const updatedVaccinations = vaccinations.filter((v) => v._id !== id);
        setVaccinations(updatedVaccinations);
      } catch (error) {
        setError("Failed to delete vaccination record");
        console.error("Error deleting vaccination:", error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      const date =
        typeof dateString === "string" ? new Date(dateString) : dateString;
      return format(date, "MMM dd, yyyy");
    } catch (e) {
      console.error("Invalid date string:", dateString, e);
      return "Invalid Date";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-red-50 rounded-lg text-center shadow-md mt-10">
        <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 mb-6">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition duration-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm text-center mt-10">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Patient Not Found
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition duration-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter p-4 sm:p-6 lg:p-8">
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <VaccinationForm
              patientId={patientId}
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
      )}

      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6 transition duration-200 text-sm"
        >
          <FiArrowLeft className="text-lg" /> Back to Vaccination Records
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Vaccination History for {patient.name}
            </h1>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl shadow-md hover:bg-orange-600 transition duration-200 text-base font-semibold"
          >
            <FiPlus className="text-lg" /> Add Vaccination
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-5">
            {patient.name} ({patient.species})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3 border-gray-200">
                Pet Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <FiInfo className="text-orange-500 text-xl" />
                  <span>
                    <strong>Breed:</strong> {patient.breed || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FiCalendar className="text-orange-500 text-xl" />
                  <span>
                    <strong>Age:</strong> {patient.age || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FiHash className="text-orange-500 text-xl" />
                  <span>
                    <strong>Patient ID:</strong> {patient.petId}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3 border-gray-200">
                Owner Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <FiUser className="text-orange-500 text-xl" />
                  <span>
                    <strong>Name:</strong> {patient.ownerName || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FiPhone className="text-orange-500 text-xl" />
                  <span>
                    <strong>Phone:</strong> {patient.ownerContact || "N/A"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FiHash className="text-orange-500 text-xl" />
                  <span>
                    <strong>Registration No:</strong>{" "}
                    {patient.registrationNumber || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">
              Vaccination Records ({vaccinations.length})
            </h3>
          </div>

          {vaccinations.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-6 text-lg">
                No vaccination records found for this patient.
              </p>
              <button
                onClick={handleAddNew}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition duration-200 text-base font-semibold"
              >
                Add First Vaccination Record
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {vaccinations.map((vaccination) => {
                if (!vaccination) return null;

                return (
                  <div
                    key={vaccination._id || vaccination.id}
                    className="bg-gray-50 p-5 rounded-2xl border border-gray-200 hover:shadow-md transition duration-200 cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/vaccination/${vaccination._id || vaccination.id}`
                      )
                    }
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <FiDroplet className="text-orange-500 text-2xl" />
                        <h4 className="text-xl font-semibold text-gray-900">
                          {vaccination.vaccineName || "Unknown Vaccine"}
                        </h4>
                      </div>
                      <div className="flex gap-3">
                        {vaccination.nextDueDate && (
                          <div className="bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                            <FiCalendar className="text-base" /> Next Due:{" "}
                            {formatDate(vaccination.nextDueDate)}
                          </div>
                        )}
                        <button
                          onClick={() => handleEdit(vaccination)}
                          className="text-gray-600 hover:text-orange-500 p-2 rounded-full hover:bg-gray-200 transition duration-200"
                          title="Edit"
                        >
                          <FiEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(vaccination._id || vaccination.id)
                          }
                          className="text-gray-600 hover:text-red-500 p-2 rounded-full hover:bg-gray-200 transition duration-200"
                          title="Delete"
                        >
                          <FiTrash className="text-lg" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base text-gray-800">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <FiCalendar className="text-gray-500 text-xl" />
                          <span>
                            <strong>Administered:</strong>{" "}
                            {formatDate(vaccination.dateAdministered)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <FiPackage className="text-gray-500 text-xl" />
                          <span>
                            <strong>Manufacturer:</strong>{" "}
                            {vaccination.manufacturer || "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <FiHash className="text-gray-500 text-xl" />
                          <span>
                            <strong>Batch:</strong>{" "}
                            {vaccination.batchNumber || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <FiUser className="text-gray-500 text-xl" />
                          <span>
                            <strong>Veterinarian:</strong>{" "}
                            {vaccination.administeringVeterinarian || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {vaccination.notes && (
                      <div className="mt-5 bg-white p-4 rounded-xl border border-gray-200">
                        <div className="flex items-center gap-3 text-gray-800 mb-2">
                          <FiClipboard className="text-gray-500 text-xl" />
                          <span className="font-semibold">Notes:</span>
                        </div>
                        <p className="text-gray-700 pl-8 text-sm leading-relaxed">
                          {vaccination.notes}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
