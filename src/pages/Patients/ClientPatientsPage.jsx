import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { clientService } from "../../api/clientService";
import { patientService } from "../../api/patientService";
import AddPatientForm from "../../components/AddPatientForm";
import EditClientForm from "../Clients/EditClientForm";
const ClientPatientsPage = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showEditClientForm, setShowEditClientForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientData, patientsData] = await Promise.all([
          clientService.getClientById(clientId),
          patientService.getPatientsByClient(clientId),
        ]);
        setClient(clientData);
        setPatients(patientsData);
      } catch (err) {
        setError("Failed to fetch data. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [clientId]);

  const handlePatientAdded = (newPatient) => {
    setPatients([...patients, newPatient]);
    setShowPatientForm(false);
  };

  const handleClientUpdated = (updatedClient) => {
    setClient(updatedClient);
    setShowEditClientForm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
        <p className="text-red-600 mb-4 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100">
        <p className="text-red-600 mb-4 font-medium">Client not found</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white min-h-screen">
      {/* Client Information Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-8">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {client.owner}
              </h2>
              <div className="mt-2 flex items-center text-gray-600">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <span>{client.contact}</span>
              </div>
              {client.email && (
                <div className="mt-1 flex items-center text-gray-600">
                  <svg
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{client.email}</span>
                </div>
              )}
              <div className="mt-1 flex items-center text-gray-600">
                <svg
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>{client.address}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowEditClientForm(true)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Edit Client
              </button>
              <button
                onClick={() => setShowPatientForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Patient
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Client Form */}
      {showEditClientForm && (
        <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <EditClientForm
            client={client}
            onSave={handleClientUpdated}
            onCancel={() => setShowEditClientForm(false)}
          />
        </div>
      )}

      {/* Add Patient Form */}
      {showPatientForm && (
        <div className="mb-8 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
          <AddPatientForm
            client={client}
            onSave={handlePatientAdded}
            onCancel={() => setShowPatientForm(false)}
          />
        </div>
      )}

      {/* Patients List Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Patients ({patients.length})
          </h3>
        </div>
        {patients.length === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-16 w-16 text-gray-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-700">
              No patients found
            </h3>
            <p className="mt-1 text-gray-500">
              This client doesn't have any patients yet.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setShowPatientForm(true)}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-sm"
              >
                Add New Patient
              </button>
            </div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Name", "Species", "Breed", "Age", "Actions"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr key={patient._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className="text-orange-600 hover:underline cursor-pointer font-medium"
                      onClick={() => navigate(`/patient/${patient._id}`)}
                    >
                      {patient.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap capitalize">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {patient.species}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.breed || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {patient.age || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="text-orange-600 hover:text-orange-800 font-medium"
                      onClick={() => navigate(`/patient/${patient._id}`)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ClientPatientsPage;
