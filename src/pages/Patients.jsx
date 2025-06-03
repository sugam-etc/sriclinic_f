import React, { useState, useEffect, useMemo } from "react";
import AddPatientForm from "../components/AddPatientForm";
import { getPatients, deletePatient } from "../api/patientService"; // Import deletePatient
import { useNavigate } from "react-router-dom";
const PatientPage = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null); // New state for editing
  const navigate = useNavigate();
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const { data } = await getPatients();
        setPatients(data);
      } catch (error) {
        console.error("Failed to fetch patients:", error);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.petCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [patients, searchTerm]);

  function formatAppointmentDate(isoString) {
    if (!isoString || isoString === "-") {
      return "-"; // Handle cases where there's no appointment
    }
    const date = new Date(isoString);

    // Options for date and time formatting
    const dateOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const timeOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true, // For AM/PM format
    };

    const formattedDate = date.toLocaleDateString(undefined, dateOptions);
    const formattedTime = date.toLocaleTimeString(undefined, timeOptions);

    return `${formattedDate} at ${formattedTime}`;
  }

  const handleAddPatientClick = () => {
    setEditingPatient(null); // Clear any editing patient
    setShowForm(true); // Show the form for adding
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient); // Set the patient to be edited
    setShowForm(true); // Show the form
  };

  const handleDeletePatient = async (patientId) => {
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        await deletePatient(patientId);
        setPatients((prev) => prev.filter((p) => p._id !== patientId));
      } catch (error) {
        console.error("Failed to delete patient:", error);
        alert("Failed to delete patient.");
      }
    }
  };

  const handlePatientFormSubmit = (updatedPatient) => {
    if (editingPatient) {
      // Update existing patient in the list
      setPatients((prev) =>
        prev.map((p) => (p._id === updatedPatient._id ? updatedPatient : p))
      );
    } else {
      // Add new patient to the list
      setPatients((prev) => [...prev, updatedPatient]);
    }
    setShowForm(false); // Close the form
    setEditingPatient(null); // Clear editing patient
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-sans text-gray-800">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-indigo-700">
          Patients
        </h1>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search by Name or Pet Code"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-80 px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition duration-200"
          />
          <button
            onClick={handleAddPatientClick} // Use the new handler
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition duration-200 font-semibold whitespace-nowrap"
          >
            Add Patient
          </button>
        </div>
      </header>

      {showForm && (
        <div className="mb-10">
          <AddPatientForm
            onPatientAdded={handlePatientFormSubmit} // Use a single handler for add/update
            onCancel={() => {
              setShowForm(false);
              setEditingPatient(null); // Clear editing patient on cancel
            }}
            patientToEdit={editingPatient} // Pass the patient to edit
          />
        </div>
      )}

      <section className="overflow-x-auto rounded-lg shadow-lg border border-gray-200 bg-white">
        <table className="min-w-full border-collapse">
          <thead className="bg-indigo-50">
            <tr>
              {[
                "Name",
                "Species",
                "Breed",
                "Age",
                "Microchip No.",
                "Sex",
                "Owner",
                "Last Appointment",
                "Actions", // Add Actions column header
              ].map((heading) => (
                <th
                  key={heading}
                  className="text-left px-6 py-4 text-indigo-700 font-semibold tracking-wide border-b border-indigo-100"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td
                  colSpan={9} // Adjust colspan to include new column
                  className="text-center py-12 text-gray-400 italic select-none"
                >
                  No patients found.
                </td>
              </tr>
            ) : (
              filteredPatients.map((p) => (
                <tr
                  key={p._id}
                  className="border-b border-gray-100 hover:bg-indigo-50 transition-colors"
                >
                  <td
                    className="px-6 py-4 font-medium text-gray-900 hover:cursor-pointer hover:underline"
                    onClick={() => {
                      navigate(`/patient/${p._id}`);
                    }}
                  >
                    {p.name}
                  </td>
                  <td className="px-6 py-4">{p.species}</td>
                  <td className="px-6 py-4">{p.breed}</td>
                  <td className="px-6 py-4">{p.age}</td>
                  <td className="px-6 py-4 font-mono tracking-wide">
                    {p.petId}
                  </td>
                  <td className="px-6 py-4 capitalize">{p.sex}</td>
                  <td className="px-6 py-4">
                    <div className="font-semibold">{p.ownerName}</div>
                    <div className="text-sm text-gray-500">
                      {p.ownerContact}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {formatAppointmentDate(p.lastAppointment)}
                  </td>
                  <td className="px-6 py-4 flex items-center space-x-2">
                    <button
                      onClick={() => handleEditPatient(p)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit Patient"
                    >
                      {/* Edit Icon (replace with your preferred icon library, e.g., Heroicons) */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-7.65 7.65a1 1 0 01-.322.253l-3 1a1 1 0 01-1.21-1.21l1-3a1 1 0 01.253-.322l7.65-7.65zM10 17a8 8 0 100-16 8 8 0 000 16z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeletePatient(p._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Patient"
                    >
                      {/* Delete Icon (replace with your preferred icon library, e.g., Heroicons) */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default PatientPage;
