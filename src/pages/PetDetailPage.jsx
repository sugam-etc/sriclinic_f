import { useParams } from "react-router-dom";
import { getPatientById } from "../api/patientService";
import { useEffect, useState } from "react";

const PetDetailPage = () => {
  const { patientId } = useParams();
  const [petData, setPetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        setLoading(true);
        const response = await getPatientById(patientId); // Axios response
        setPetData(response.data); // Axios responses wrap the data in `data`
        console.log("Fetched petData:", response.data);
      } catch (err) {
        setError("Failed to fetch pet data.");
        console.error("Error fetching pet data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPetData();
    }
  }, [patientId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-gray-700">Loading pet details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  if (!petData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-gray-700">No pet data found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Pet Details</h1>

      {/* Pet Information Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">
              <span className="font-medium">Name:</span> {petData.name}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Species:</span> {petData.species}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Breed:</span> {petData.breed}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Age:</span> {petData.age}
            </p>
          </div>
          <div>
            <p className="text-gray-600">
              <span className="font-medium">Sex:</span> {petData.sex}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Pet ID:</span> {petData.petId}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Owner:</span> {petData.ownerName}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Contact:</span>{" "}
              {petData.ownerContact}
            </p>
          </div>
        </div>
      </div>

      {/* Medical History Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Medical History
        </h2>

        {petData.medicalHistory.map((record, index) => (
          <div
            key={record._id}
            className={`mb-6 pb-6 ${
              index !== petData.medicalHistory.length - 1
                ? "border-b border-gray-200"
                : ""
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-gray-800">
                Visit #{index + 1}
              </h3>
              <span className="text-sm text-gray-500">
                {formatDate(record.date)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-gray-600">
                  <span className="font-medium">Veterinarian:</span>{" "}
                  {record.vetenarian}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Diagnosis:</span>{" "}
                  {record.diagnosis}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Treatment:</span>{" "}
                  {record.treatment}
                </p>
              </div>
              <div>
                <p className="text-gray-600">
                  <span className="font-medium">Follow-up:</span>{" "}
                  {formatDate(record.followUpDate)}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Notes:</span> {record.notes}
                </p>
              </div>
            </div>

            {/* Medications */}
            <div className="mt-4">
              <h4 className="font-medium text-gray-700 mb-2">
                Medications Prescribed:
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-50 rounded">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dosage
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Frequency
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {record.medications.map((med) => (
                      <tr key={med._id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                          {med.name}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                          {med.dosage}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                          {med.quantity}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                          {med.duration}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                          {med.frequency}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PetDetailPage;
