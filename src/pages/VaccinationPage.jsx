import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaCalendarCheck,
  FaTrash,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import {
  getAppointments,
  deleteAppointment,
} from "../api/appointmentService.js";
// Import 'isValid' in addition to other date-fns functions
import { format, isSameDay, parseISO, parse, isValid } from "date-fns";

const VaccinationPage = () => {
  const [vaccinations, setVaccinations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVaccinations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAppointments();
      const filtered = response.data.filter(
        (appointment) =>
          appointment.reason &&
          appointment.reason.toLowerCase() === "vaccination"
      );

      setVaccinations(filtered);
    } catch (err) {
      console.error("Failed to fetch vaccinations:", err);
      setError(err.message || "Failed to load vaccination appointments.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccinations();
  }, []);

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this vaccination appointment?"
      )
    ) {
      try {
        await deleteAppointment(id);
        fetchVaccinations();
      } catch (err) {
        console.error("Failed to delete vaccination appointment:", err);
        setError(err.message || "Failed to delete appointment.");
      }
    }
  };

  const filteredVaccinations = vaccinations.filter((vax) => {
    const term = searchTerm.toLowerCase();
    return (
      (vax.clientName && vax.clientName.toLowerCase().includes(term)) ||
      (vax.petName && vax.petName.toLowerCase().includes(term)) ||
      (vax.reason && vax.reason.toLowerCase().includes(term)) ||
      (vax.notes && vax.notes.toLowerCase().includes(term))
    );
  });

  const sortedAndFilteredForDisplay = [...filteredVaccinations].sort((a, b) => {
    const dateA = parseISO(a.date);
    const dateB = parseISO(b.date);

    // Safely parse time strings for sorting
    const timeA =
      a.time && typeof a.time === "string"
        ? parse(a.time, "HH:mm", new Date())
        : null;
    const timeB =
      b.time && typeof b.time === "string"
        ? parse(b.time, "HH:mm", new Date())
        : null;

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const isAToday = isValid(dateA) && isSameDay(dateA, today);
    const isBToday = isValid(dateB) && isSameDay(dateB, today);
    const isATomorrow = isValid(dateA) && isSameDay(dateA, tomorrow);
    const isBTomorrow = isValid(dateB) && isSameDay(dateB, tomorrow);

    const isAUpscoming = isValid(dateA) && dateA > today;
    const isBUpscoming = isValid(dateB) && dateB > today;

    // Primary sort: Today > Tomorrow > Upcoming > Past (Latest first)
    if (isAToday && !isBToday) return -1;
    if (!isAToday && isBToday) return 1;

    if (isATomorrow && !isBTomorrow) return -1;
    if (!isATomorrow && isBTomorrow) return 1;

    if (isAUpscoming && isBUpscoming) {
      // Sort upcoming by date and then time
      const dateDiff = dateA.getTime() - dateB.getTime();
      if (dateDiff !== 0) return dateDiff;
      // If times exist and are valid, compare them
      if (timeA && isValid(timeA) && timeB && isValid(timeB)) {
        return timeA.getTime() - timeB.getTime();
      } else if (timeA && isValid(timeA)) {
        // A has valid time, B doesn't (A comes first)
        return -1;
      } else if (timeB && isValid(timeB)) {
        // B has valid time, A doesn't (B comes first)
        return 1;
      }
      return 0; // Neither has valid time, or both are invalid
    }
    if (isAUpscoming && !isBUpscoming) return -1;
    if (!isAUpscoming && isBUpscoming) return 1;

    // For past dates, sort latest first, then by time
    const dateDiff = dateB.getTime() - dateA.getTime();
    if (dateDiff !== 0) return dateDiff;
    // If times exist and are valid, compare them
    if (timeA && isValid(timeA) && timeB && isValid(timeB)) {
      return timeA.getTime() - timeB.getTime();
    } else if (timeA && isValid(timeA)) {
      // A has valid time, B doesn't (A comes first)
      return -1;
    } else if (timeB && isValid(timeB)) {
      // B has valid time, A doesn't (B comes first)
      return 1;
    }
    return 0; // Neither has valid time, or both are invalid
  });

  const totalVaccinationAppointments = vaccinations.length;
  const upcomingVaccinations = vaccinations.filter(
    (vax) => isValid(parseISO(vax.date)) && parseISO(vax.date) > new Date()
  ).length;

  const totalClientsVaccinated = new Set(
    vaccinations.map((vax) => vax.clientName)
  ).size;

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-600">
        Loading vaccination appointments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        Error: {error}
        <button
          onClick={fetchVaccinations}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-indigo-700">
          Vaccination Appointments
        </h1>
      </div>

      <div className="mb-6">
        <input
          type="search"
          placeholder="Search by client, pet, reason, or notes"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md rounded-lg border border-gray-300 p-3 text-lg focus:outline-blue-500 focus:border-blue-500"
          aria-label="Search vaccination appointments"
        />
      </div>

      <section className="mb-8 grid grid-cols-3 gap-6 text-center bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {totalVaccinationAppointments}
          </h2>
          <p className="text-gray-600 font-medium">Total Vaccinations</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {upcomingVaccinations}
          </h2>
          <p className="text-gray-600 font-medium">Upcoming Vaccinations</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {totalClientsVaccinated}
          </h2>
          <p className="text-gray-600 font-medium">Clients Vaccinated</p>
        </div>
      </section>

      <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-sm">
        <table className="w-full text-left text-gray-700">
          <thead className="bg-indigo-500 text-white border-b border-gray-300">
            <tr>
              <th className="p-3 font-semibold border-r border-gray-300">
                Date
              </th>
              <th className="p-3 font-semibold border-r border-gray-300">
                Client Name
              </th>
              <th className="p-3 font-semibold border-r border-gray-300">
                Pet Name
              </th>
              <th className="p-3 font-semibold border-r border-gray-300">
                Pet Type
              </th>
              <th className="p-3 font-semibold border-r border-gray-300">
                Pet Age
              </th>
              <th className="p-3 font-semibold border-r border-gray-300">
                Reason
              </th>
              <th className="p-3 font-semibold border-r border-gray-300">
                Contact
              </th>
              <th className="p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredForDisplay.length > 0 ? (
              sortedAndFilteredForDisplay.map((vax, index) => {
                const parsedDate = parseISO(vax.date);
                const parsedTime =
                  vax.time &&
                  typeof vax.time === "string" &&
                  vax.time.trim() !== ""
                    ? parse(vax.time, "HH:mm", new Date())
                    : null;

                return (
                  <tr
                    key={vax._id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50`}
                  >
                    <td className="p-3 border-b border-r border-gray-200">
                      {/* Check if parsedDate is valid before formatting */}
                      {isValid(parsedDate)
                        ? format(parsedDate, "MMM dd, yyyy")
                        : "Invalid Date"}
                      {/* Check if parsedTime is valid before formatting */}
                      {parsedTime && isValid(parsedTime) && (
                        <span className="block text-xs text-gray-500">
                          {format(parsedTime, "hh:mm a")}
                        </span>
                      )}
                    </td>
                    <td className="p-3 border-b border-r border-gray-200">
                      {vax.clientName}
                    </td>
                    <td className="p-3 border-b border-r border-gray-200">
                      {vax.petName}
                    </td>
                    <td className="p-3 border-b border-r border-gray-200">
                      {vax.petType}
                    </td>
                    <td className="p-3 border-b border-r border-gray-200">
                      {vax.petAge}
                    </td>
                    <td className="p-3 border-b border-r border-gray-200">
                      {vax.reason}
                    </td>
                    <td className="p-3 border-b border-r border-gray-200">
                      {vax.contactNumber || "-"}
                    </td>
                    <td className="p-3 border-b border-gray-200">
                      <button
                        onClick={() => handleDelete(vax._id)}
                        aria-label={`Delete vaccination for ${vax.petName}`}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center p-8 text-gray-400 text-lg bg-white"
                >
                  No vaccination appointments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VaccinationPage;
