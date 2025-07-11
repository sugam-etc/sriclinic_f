import React, { useState, useEffect } from "react";
import { medicalRecordService } from "../api/medicalRecordService";
import { patientService } from "../api/patientService";
import { vaccinationService } from "../api/vaccinationService";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import {
  FaCalendarAlt,
  FaFileMedicalAlt,
  FaNotesMedical,
  FaSyringe,
} from "react-icons/fa";
import { GiHealthNormal } from "react-icons/gi";

const AppointmentsPage = () => {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastVisits, setPastVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedVisit, setExpandedVisit] = useState(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [records, vaccinations] = await Promise.all([
        medicalRecordService.getAllMedicalRecords(),
        vaccinationService.getAllVaccinations(),
      ]);

      const now = new Date();
      const upcoming = [];
      const past = [];

      // Process medical records
      for (const record of records) {
        if (record.followUpDate) {
          const appointmentDate = parseISO(record.followUpDate);
          const patientData = await getPatientData(record.patient);

          const appointment = {
            type: "medical",
            id: record._id,
            date: appointmentDate,
            patientName: patientData.name,
            patientSpecies: patientData.species,
            patientBreed: patientData.breed,
            ownerName: patientData.ownerName,
            reason: record.reason || "Follow-up",
            veterinarian: record.veterinarian,
            diagnosis: record.diagnosis,
            treatment: record.treatment,
            notes: record.notes,
            weight: record.weight,
            clinicalExamination: record.clinicalExamination,
            medications: record.medications,
          };

          if (isAfter(appointmentDate, now)) {
            upcoming.push(appointment);
          } else {
            past.push(appointment);
          }
        }
      }

      // Process vaccination records
      for (const vaccine of vaccinations) {
        const appointmentDate = parseISO(vaccine.dateAdministered);
        const patientData = await getPatientData(vaccine.patient);

        const appointment = {
          type: "vaccination",
          id: vaccine._id,
          date: appointmentDate,
          patientName: patientData.name,
          patientSpecies: patientData.species,
          patientBreed: patientData.breed,
          ownerName: patientData.ownerName,
          reason: `${vaccine.vaccineName} Vaccine`,
          veterinarian: vaccine.administeringVeterinarian,
          vaccineName: vaccine.vaccineName,
          nextDueDate: vaccine.nextDueDate,
          batchNumber: vaccine.batchNumber,
          notes: vaccine.notes,
        };

        past.push(appointment);
      }

      upcoming.sort((a, b) => a.date - b.date);
      past.sort((a, b) => b.date - a.date);

      setUpcomingAppointments(upcoming);
      setPastVisits(past);
    } catch (err) {
      setError("Failed to load appointments. Please try again.");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const getPatientData = async (patientRef) => {
    try {
      if (!patientRef)
        return {
          name: "Unknown Patient",
          species: "Unknown",
          breed: "Unknown",
          ownerName: "Unknown Owner",
        };

      const patientId =
        typeof patientRef === "string" ? patientRef : patientRef._id;
      const patient = await patientService.getPatientById(patientId);

      return {
        name: patient?.name || "Unknown Patient",
        species: patient?.species || "Unknown",
        breed: patient?.breed || "Unknown",
        ownerName: patient?.ownerName || "Unknown Owner",
      };
    } catch (error) {
      console.error("Error fetching patient:", error);
      return {
        name: "Unknown Patient",
        species: "Unknown",
        breed: "Unknown",
        ownerName: "Unknown Owner",
      };
    }
  };

  const toggleVisitExpansion = (id) => {
    setExpandedVisit(expandedVisit === id ? null : id);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-gray-100 text-center">
        <p className="text-red-600 mb-4 font-medium">{error}</p>
        <button
          onClick={fetchAllData}
          className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white min-h-screen">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
            <FaCalendarAlt className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Appointments Management
            </h1>
            <p className="text-gray-500 mt-1">
              {activeTab === "upcoming"
                ? "Upcoming appointments"
                : "Patient visit history"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 ${
            activeTab === "upcoming"
              ? "text-orange-600 border-b-2 border-orange-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaCalendarAlt />
          Upcoming ({upcomingAppointments.length})
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`px-6 py-3 font-medium text-sm flex items-center gap-2 ${
            activeTab === "past"
              ? "text-orange-600 border-b-2 border-orange-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FaFileMedicalAlt />
          Past Visits ({pastVisits.length})
        </button>
      </div>

      {activeTab === "upcoming" ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
          {upcomingAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      "Patient",
                      "Date & Time",
                      "Purpose",
                      "Owner",
                      "Veterinarian",
                      "Status",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {upcomingAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                            <span className="text-orange-600">
                              {appointment.patientSpecies === "Canine"
                                ? "🐶"
                                : "🐱"}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.patientName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.patientBreed}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {format(appointment.date, "MMM d, yyyy")}
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(appointment.date, "h:mm a")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {appointment.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.ownerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appointment.veterinarian || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Confirmed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">
              <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">
                No upcoming appointments
              </h3>
              <p className="mt-1 text-gray-500">All clear for now!</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {pastVisits.length > 0 ? (
            pastVisits.map((visit) => (
              <div
                key={visit.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
              >
                <div
                  className={`p-4 cursor-pointer ${
                    expandedVisit === visit.id
                      ? "bg-gray-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => toggleVisitExpansion(visit.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-3 rounded-lg ${
                          visit.type === "medical"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {visit.type === "medical" ? (
                          <FaNotesMedical />
                        ) : (
                          <FaSyringe />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {visit.patientName} • {visit.patientBreed}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {format(visit.date, "MMMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          visit.type === "medical"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {visit.type === "medical"
                          ? "Medical Visit"
                          : "Vaccination"}
                      </span>
                      <svg
                        className={`h-5 w-5 text-gray-400 transform transition-transform ${
                          expandedVisit === visit.id ? "rotate-180" : ""
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {expandedVisit === visit.id && (
                  <div className="border-t border-gray-200 p-4">
                    {visit.type === "medical" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                              <GiHealthNormal /> Diagnosis
                            </h4>
                            <p className="mt-1 text-sm">
                              {visit.diagnosis?.join(", ") ||
                                "No diagnosis recorded"}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                              <FaNotesMedical /> Treatment
                            </h4>
                            <p className="mt-1 text-sm">
                              {visit.treatment?.join(", ") ||
                                "No treatment recorded"}
                            </p>
                          </div>
                        </div>
                        {visit.medications?.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Medications Prescribed
                            </h4>
                            <ul className="mt-1 space-y-1">
                              {visit.medications.map((med, idx) => (
                                <li key={idx} className="text-sm">
                                  <span className="font-medium">
                                    {med.name}
                                  </span>{" "}
                                  - {med.dosage} ({med.frequency})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                              <FaSyringe /> Vaccine
                            </h4>
                            <p className="mt-1 text-sm">{visit.vaccineName}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                              <FaCalendarAlt /> Next Due
                            </h4>
                            <p className="mt-1 text-sm">
                              {format(
                                parseISO(visit.nextDueDate),
                                "MMMM d, yyyy"
                              )}
                            </p>
                          </div>
                        </div>
                        {visit.notes && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Notes
                            </h4>
                            <p className="mt-1 text-sm whitespace-pre-line">
                              {visit.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
              <FaFileMedicalAlt className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">
                No past visits found
              </h3>
              <p className="mt-1 text-gray-500">
                Patient visit history will appear here
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
