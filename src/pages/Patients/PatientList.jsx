import React, { useState, useEffect } from "react";
import { clientService } from "../../api/clientService";
import { FiSearch, FiX } from "react-icons/fi";
import { FaDog, FaCat, FaPaw } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PatientListPage = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const clients = await clientService.getClients();

        const allPatients = clients.reduce((acc, client) => {
          if (client.patients && client.patients.length > 0) {
            return [
              ...acc,
              ...client.patients.map((patient) => ({
                ...patient,
                clientName: client.owner,
                clientContact: client.contact,
              })),
            ];
          }
          return acc;
        }, []);

        setPatients(allPatients);
        setFilteredPatients(allPatients);
      } catch (err) {
        setError(err.message || "Failed to fetch patients");
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredPatients(patients);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(term) ||
        (patient.petId && patient.petId.toLowerCase().includes(term)) ||
        (patient.registrationNumber &&
          patient.registrationNumber.toLowerCase().includes(term)) ||
        (patient.clientName &&
          patient.clientName.toLowerCase().includes(term)) ||
        (patient.breed && patient.breed.toLowerCase().includes(term))
    );

    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  const getSpeciesIcon = (species) => {
    switch (species) {
      case "Canine":
        return (
          <div className="p-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-400 text-white shadow-md">
            <FaDog className="text-lg" />
          </div>
        );
      case "Feline":
        return (
          <div className="p-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-400 text-white shadow-md">
            <FaCat className="text-lg" />
          </div>
        );
      default:
        return (
          <div className="p-2 rounded-full bg-gradient-to-br from-orange-500 to-orange-400 text-white shadow-md">
            <FaPaw className="text-lg" />
          </div>
        );
    }
  };

  const handlePatientClick = (patientId) => {
    navigate(`/patient/${patientId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="px-8 py-6 bg-red-100 rounded-xl text-red-700 shadow-lg">
          <p className="text-lg font-medium">Error:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-lg p-6 md:p-10 lg:p-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 md:mb-10">
          <h1 className="text-4xl lg:text-5xl  text-gray-900 leading-tight">
            Patient Registry
          </h1>
          <div className="mt-4 md:mt-0 text-gray-500 text-lg md:text-xl font-medium">
            Total Patients:{" "}
            <span className="font-bold text-orange-500">
              {filteredPatients.length}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8 md:mb-10">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400 text-xl" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-3 md:py-4 border border-gray-300 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 ease-in-out"
            placeholder="Search by name, microchip, registration number, owner, or breed..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <FiX className="text-xl" />
            </button>
          )}
        </div>

        {/* Patient Grid/Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-11 bg-gray-100 px-6 py-4 border-b border-gray-200 text-gray-600 font-semibold text-sm uppercase tracking-wider">
            <div className="col-span-3">Patient</div>
            <div className="col-span-2">Species/Breed</div>
            <div className="col-span-2">ID Numbers</div>
            <div className="col-span-2">Owner</div>
            <div className="col-span-2">Contact</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {filteredPatients.length > 0 ? (
              filteredPatients.map((patient) => (
                <div
                  key={patient._id}
                  className="grid grid-cols-1 md:grid-cols-11 px-6 py-5 hover:bg-orange-50 transition-colors duration-250 ease-in-out cursor-pointer"
                  onClick={() => handlePatientClick(patient._id)}
                >
                  <div className="col-span-3 flex items-center space-x-4 mb-3 md:mb-0">
                    {getSpeciesIcon(patient.species)}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {patient.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {patient.age} •{" "}
                        {patient.sex?.toLowerCase() || "unknown"}
                      </p>
                    </div>
                  </div>

                  <div className="col-span-2 mb-3 md:mb-0">
                    <p className="text-gray-800 text-base">{patient.species}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {patient.breed || "Unknown breed"}
                    </p>
                  </div>

                  <div className="col-span-2 mb-3 md:mb-0">
                    {patient.petId && (
                      <p className="text-sm text-gray-800">
                        <span className="text-gray-500">Microchip:</span>{" "}
                        {patient.petId}
                      </p>
                    )}
                    <p className="text-sm text-gray-800 mt-0.5">
                      <span className="text-gray-500">Reg:</span>{" "}
                      {patient.registrationNumber}
                    </p>
                  </div>

                  <div className="col-span-2 mb-3 md:mb-0">
                    <p className="text-gray-800 text-base">
                      {patient.clientName}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <p className="text-gray-800 text-base">
                      {patient.clientContact}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-16 text-center">
                <p className="text-gray-500 text-lg">
                  {searchTerm
                    ? "No patients match your search criteria. Try a different term!"
                    : "No patients registered yet. Time to add some furry friends!"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientListPage;
