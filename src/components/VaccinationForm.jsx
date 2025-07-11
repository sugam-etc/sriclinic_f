import { useState, useEffect } from "react";
// import { vaccinationService } from "../api/vaccinationService";
import { patientService } from "../api/patientService";

export default function VaccinationForm({ patientId, onSave, onCancel }) {
  const [form, setForm] = useState({
    vaccineName: "",
    dateAdministered: new Date().toISOString().split("T")[0],
    nextDueDate: "",
    batchNumber: "",
    manufacturer: "",
    notes: "",
    isBooster: false,
    routeOfAdministration: "",
    reactionObserved: "",
    administeringVeterinarian: "",
  });

  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (patientId) {
      const loadPatientData = async () => {
        try {
          const patient = await patientService.getPatientById(patientId);
          setPatientData(patient);
        } catch (err) {
          setError("Failed to load patient data", err);
        }
      };
      loadPatientData();
    }
  }, [patientId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setForm({ ...form, [name]: checked });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate required fields
      if (!form.vaccineName) {
        throw new Error("Vaccine name is required");
      }
      if (!form.dateAdministered) {
        throw new Error("Date administered is required");
      }
      if (!form.nextDueDate) {
        throw new Error("Next due date is required");
      }

      // Calculate next due date if not provided
      let nextDueDate = form.nextDueDate;
      if (!nextDueDate && form.dateAdministered) {
        const adminDate = new Date(form.dateAdministered);
        adminDate.setFullYear(adminDate.getFullYear() + 1); // Default to 1 year later
        nextDueDate = adminDate.toISOString().split("T")[0];
      }

      // Prepare data for API
      const payload = {
        patient: patientId,
        vaccineName: form.vaccineName,
        dateAdministered: form.dateAdministered,
        nextDueDate: nextDueDate,
        batchNumber: form.batchNumber || undefined,
        manufacturer: form.manufacturer || undefined,
        administeringVeterinarian: form.administeringVeterinarian || undefined,
        notes: form.notes || undefined,
        isBooster: form.isBooster,
        routeOfAdministration: form.routeOfAdministration || undefined,
        reactionObserved: form.reactionObserved || undefined,
      };

      // Call onSave with the prepared data
      onSave(payload);
    } catch (error) {
      console.error("Validation error:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white max-w-4xl mx-auto p-8 rounded-3xl shadow-xl border border-gray-100 font-inter">
      <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center">
        New Vaccination Record
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-orange-100 text-orange-700 rounded-xl border border-orange-200">
          {error}
        </div>
      )}

      {patientData && (
        <section className="mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <h3 className="text-xl font-medium text-gray-800 mb-5">
            Patient Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-semibold text-gray-900">{patientData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Species</p>
              <p className="font-semibold text-gray-900">
                {patientData.species}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Breed</p>
              <p className="font-semibold text-gray-900">
                {patientData.breed || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Age</p>
              <p className="font-semibold text-gray-900">
                {patientData.age || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Registration</p>
              <p className="font-semibold text-gray-900">
                {patientData.registrationNumber}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Owner</p>
              <p className="font-semibold text-gray-900">
                {patientData.client?.owner || "-"}
              </p>
            </div>
          </div>
        </section>
      )}

      <form onSubmit={handleSubmit}>
        <section className="mb-10">
          <h3 className="text-xl font-medium text-gray-800 mb-5">
            Vaccination Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vaccine Name <span className="text-orange-500">*</span>
              </label>
              <input
                type="text"
                name="vaccineName"
                value={form.vaccineName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Administered <span className="text-orange-500">*</span>
              </label>
              <input
                type="date"
                name="dateAdministered"
                value={form.dateAdministered}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Next Due Date <span className="text-orange-500">*</span>
              </label>
              <input
                type="date"
                name="nextDueDate"
                value={form.nextDueDate}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch Number
              </label>
              <input
                type="text"
                name="batchNumber"
                value={form.batchNumber}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturer
              </label>
              <input
                type="text"
                name="manufacturer"
                value={form.manufacturer}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Administering Veterinarian
              </label>
              <input
                type="text"
                name="administeringVeterinarian"
                value={form.administeringVeterinarian}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booster Shot?
              </label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isBooster"
                  checked={form.isBooster}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  {form.isBooster ? "Yes" : "No"}
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Route of Administration
              </label>
              <select
                name="routeOfAdministration"
                value={form.routeOfAdministration}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
              >
                <option value="">Select Route</option>
                <option value="Subcutaneous">Subcutaneous</option>
                <option value="Intramuscular">Intramuscular</option>
                <option value="Oral">Oral</option>
                <option value="Intranasal">Intranasal</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reaction Observed
              </label>
              <input
                type="text"
                name="reactionObserved"
                value={form.reactionObserved}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 min-h-[100px]"
              />
            </div>
          </div>
        </section>

        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-8 py-3 rounded-xl transition duration-200"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition duration-200 ${
              isLoading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Saving..." : "Save Vaccination"}
          </button>
        </div>
      </form>
    </div>
  );
}
