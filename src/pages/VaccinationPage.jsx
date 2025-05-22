import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaCalendarCheck,
  FaTrash,
  FaFileInvoiceDollar,
} from "react-icons/fa"; // Using FaCalendarCheck for appointments
import {
  getAppointments,
  deleteAppointment,
} from "../api/appointmentService.js"; // Import appointment services
import { format, isSameDay, parseISO } from "date-fns";

const VaccinationPage = () => {
  const [vaccinations, setVaccinations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch appointments and filter for vaccinations
  const fetchVaccinations = async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear previous errors
      const response = await getAppointments();
      // Filter items where reason is 'vaccination' (case-insensitive)
      const filtered = response.data.filter(
        (appointment) =>
          appointment.reason &&
          appointment.reason.toLowerCase() === "vaccination"
      );

      // Sort vaccinations by date in descending order (latest first)
      const sortedVaccinations = filtered.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime(); // Latest date first
      });

      setVaccinations(sortedVaccinations);
    } catch (err) {
      console.error("Failed to fetch vaccinations:", err);
      setError(err.message || "Failed to load vaccination appointments.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch vaccinations on component mount
  useEffect(() => {
    fetchVaccinations();
  }, []);

  // Handles deleting a vaccination appointment
  const handleDelete = async (id) => {
    // Using window.confirm for simplicity, consider a custom modal for better UX
    if (
      window.confirm(
        "Are you sure you want to delete this vaccination appointment?"
      )
    ) {
      try {
        await deleteAppointment(id);
        fetchVaccinations(); // Re-fetch vaccinations to update the list
      } catch (err) {
        console.error("Failed to delete vaccination appointment:", err);
        setError(err.message || "Failed to delete appointment.");
      }
    }
  };

  // Filters vaccinations based on the search term
  const filteredVaccinations = vaccinations.filter((vax) => {
    const term = searchTerm.toLowerCase();
    return (
      (vax.clientName && vax.clientName.toLowerCase().includes(term)) ||
      (vax.petName && vax.petName.toLowerCase().includes(term)) ||
      (vax.reason && vax.reason.toLowerCase().includes(term)) ||
      (vax.notes && vax.notes.toLowerCase().includes(term))
    );
  });

  // Group vaccinations by date for display
  const groupedVaccinations = filteredVaccinations.reduce((acc, vax) => {
    const vaxDate = format(parseISO(vax.date), "yyyy-MM-dd");
    if (!acc[vaxDate]) {
      acc[vaxDate] = [];
    }
    acc[vaxDate].push(vax);
    return acc;
  }, {});

  // Sort dates in descending order (latest date first)
  const sortedDates = Object.keys(groupedVaccinations).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  // Calculate summary statistics for vaccinations
  const totalVaccinationAppointments = vaccinations.length;
  const upcomingVaccinations = vaccinations.filter(
    (vax) => parseISO(vax.date) > new Date()
  ).length;

  // Get unique client names for total clients vaccinated
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
        {/* Removed "Add Medicine" button as this page is for display only */}
      </div>

      <div className="mb-6">
        <input
          type="search"
          placeholder="Search by client, pet, reason, or notes"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md rounded-xl border border-gray-300 p-4 text-lg focus:outline-indigo-500"
          aria-label="Search vaccination appointments"
        />
      </div>

      <section className="mb-8 grid grid-cols-3 gap-6 text-center bg-indigo-50 p-6 rounded-xl shadow-sm">
        <div>
          <h2 className="text-2xl font-semibold text-indigo-900">
            {totalVaccinationAppointments}
          </h2>
          <p className="text-indigo-700 font-medium">Total Vaccinations</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-indigo-900">
            {upcomingVaccinations}
          </h2>
          <p className="text-indigo-700 font-medium">Upcoming Vaccinations</p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-indigo-900">
            {totalClientsVaccinated}
          </h2>
          <p className="text-indigo-700 font-medium">Clients Vaccinated</p>
        </div>
      </section>

      <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Client Name</th>
              <th className="p-4">Pet Name</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Notes</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVaccinations.length > 0 ? (
              sortedDates.map((date, dateIndex) => (
                <React.Fragment key={date}>
                  {dateIndex > 0 && (
                    <tr>
                      <td colSpan="6" className="py-4"></td>{" "}
                      {/* Margin between days */}
                    </tr>
                  )}
                  <tr>
                    <td
                      colSpan="6"
                      className="p-4 bg-gray-100 text-gray-700 font-semibold"
                    >
                      {format(parseISO(date), "EEEE, MMMM dd,yyyy")}
                    </td>
                  </tr>
                  {groupedVaccinations[date].map((vax) => (
                    <tr
                      key={vax._id}
                      className="border-b border-gray-300 hover:bg-indigo-50"
                    >
                      <td className="p-4">
                        {format(parseISO(vax.date), "MMM dd,yyyy")}
                      </td>
                      <td className="p-4">{vax.clientName}</td>
                      <td className="p-4">{vax.petName}</td>
                      <td className="p-4">{vax.reason}</td>
                      <td className="p-4">{vax.notes || "-"}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDelete(vax._id)}
                          aria-label={`Delete vaccination for ${vax.petName}`}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center p-8 text-gray-400 text-lg"
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
