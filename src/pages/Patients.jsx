import React, { useState, useEffect, useMemo } from "react";
import AddPatientForm from "../components/AddPatientForm";
import { getPatients } from "../api/patientService";

const PatientPage = () => {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

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
            onClick={() => setShowForm((v) => !v)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition duration-200 font-semibold whitespace-nowrap"
          >
            {showForm ? "Close Form" : "Add Patient"}
          </button>
        </div>
      </header>

      {showForm && (
        <div className="mb-10">
          <AddPatientForm
            onPatientAdded={(newPatient) =>
              setPatients((prev) => [...prev, newPatient])
            }
            onCancel={() => setShowForm(false)}
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
                "Pet Code",
                "Sex",
                "Owner",
                "Last Appointment",
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
                  colSpan={8}
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
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {p.name}
                  </td>
                  <td className="px-6 py-4">{p.species}</td>
                  <td className="px-6 py-4">{p.breed}</td>
                  <td className="px-6 py-4 font-mono tracking-wide">
                    {p.petCode}
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
                  {/* <td className="px-6 py-4">
                    {formatAppointmentDate(p.nextAppointment)}
                  </td> */}
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
