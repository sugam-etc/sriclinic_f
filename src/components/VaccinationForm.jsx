import { useState, useEffect } from "react";
import {
  createVaccination,
  updateVaccination,
} from "../api/vaccinationService"; // Correct path

export default function VaccinationForm({
  existing,
  onClose,
  isCompletingAppointment = false,
}) {
  const [form, setForm] = useState({
    patientName: "",
    patientSpecies: "",
    patientBreed: "",
    patientAge: "",
    patientId: "",
    ownerName: "",
    ownerPhone: "",
    vaccineName: "",
    dateAdministered: "",
    nextDueDate: "",
    batchNumber: "",
    manufacturer: "",
    notes: "",
    status: "upcoming", // Default status
  });

  useEffect(() => {
    if (existing) {
      // When editing an existing record, populate the form
      setForm({
        ...existing,
        // Format dates for input type="date"
        dateAdministered: existing.dateAdministered
          ? existing.dateAdministered.slice(0, 10)
          : "",
        nextDueDate: existing.nextDueDate
          ? existing.nextDueDate.slice(0, 10)
          : "",
      });
    } else {
      // When creating a new record, reset the form and default status to 'upcoming'
      setForm({
        patientName: "",
        patientSpecies: "",
        patientBreed: "",
        patientAge: "",
        patientId: "",
        ownerName: "",
        ownerPhone: "",
        vaccineName: "",
        dateAdministered: "",
        nextDueDate: "",
        batchNumber: "",
        manufacturer: "",
        notes: "",
        status: "upcoming",
      });
    }
  }, [existing]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      const dataToSave = { ...form };

      // Determine status based on vaccineName and dateAdministered
      // Set status to 'completed' only if both vaccineName and dateAdministered are provided
      if (dataToSave.vaccineName && dataToSave.dateAdministered) {
        dataToSave.status = "completed";
      } else {
        dataToSave.status = "upcoming"; // Otherwise, it's an upcoming appointment
      }

      if (form._id) {
        await updateVaccination(form._id, dataToSave);
      } else {
        await createVaccination(dataToSave);
      }
      onClose();
    } catch (err) {
      console.error("Error saving vaccination:", err);
      // Implement a user-friendly error message here instead of just console.error
      // For example, using a state variable to show an error message on the form.
    }
  };

  // Determine if a field is required based on the form's current state and context
  const isRequired = (fieldName) => {
    // Patient and Owner info are required if the form is being completed or if it's a new entry and these fields are being filled
    const isPatientOwnerInfoRequired =
      form.status === "completed" || isCompletingAppointment;

    switch (fieldName) {
      case "patientName":
      case "patientSpecies":
      case "patientId":
      case "ownerName":
      case "ownerPhone":
        // These fields are required if completing an appointment OR if the form is already in 'completed' status
        // AND the field is currently empty.
        return isPatientOwnerInfoRequired && !form[fieldName];
      case "vaccineName":
      case "dateAdministered":
        // These fields are required only when completing an appointment or if the form is already in 'completed' status
        return form.status === "completed" || isCompletingAppointment;
      default:
        return false;
    }
  };

  return (
    <div className="bg-white max-w-4xl mx-auto p-6 rounded-2xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {form._id
          ? isCompletingAppointment
            ? "Complete Vaccination Record"
            : "Edit Vaccination Record"
          : "New Vaccination Entry"}
      </h2>

      {/* Patient Info */}
      <section className="mb-8">
        <h3 className="text-xl font-medium text-gray-700 mb-4">Pet Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="patientName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Pet Name{" "}
              {isRequired("patientName") && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <input
              type="text"
              name="patientName"
              id="patientName"
              placeholder="Pet Name"
              value={form.patientName}
              onChange={handleChange}
              className="input w-full p-2 border border-gray-300 rounded-md"
              required={isRequired("patientName")}
            />
          </div>
          <div>
            <label
              htmlFor="patientSpecies"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Species{" "}
              {isRequired("patientSpecies") && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <input
              type="text"
              name="patientSpecies"
              id="patientSpecies"
              placeholder="Species"
              value={form.patientSpecies}
              onChange={handleChange}
              className="input w-full p-2 border border-gray-300 rounded-md"
              required={isRequired("patientSpecies")}
            />
          </div>
          <div>
            <label
              htmlFor="patientBreed"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Breed
            </label>
            <input
              type="text"
              name="patientBreed"
              id="patientBreed"
              placeholder="Breed"
              value={form.patientBreed}
              onChange={handleChange}
              className="input w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="patientAge"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Age
            </label>
            <input
              type="text"
              name="patientAge"
              id="patientAge"
              placeholder="Age"
              value={form.patientAge}
              onChange={handleChange}
              className="input w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="patientId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Pet ID{" "}
              {isRequired("patientId") && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <input
              type="text"
              name="patientId"
              id="patientId"
              placeholder="Pet ID"
              value={form.patientId}
              onChange={handleChange}
              className="input w-full p-2 border border-gray-300 rounded-md"
              required={isRequired("patientId")}
            />
          </div>
        </div>
      </section>

      {/* Owner Info */}
      <section className="mb-8">
        <h3 className="text-xl font-medium text-gray-700 mb-4">Owner Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="ownerName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Owner Name{" "}
              {isRequired("ownerName") && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <input
              type="text"
              name="ownerName"
              id="ownerName"
              placeholder="Owner Name"
              value={form.ownerName}
              onChange={handleChange}
              className="input w-full p-2 border border-gray-300 rounded-md"
              required={isRequired("ownerName")}
            />
          </div>
          <div>
            <label
              htmlFor="ownerPhone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Owner Phone{" "}
              {isRequired("ownerPhone") && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <input
              type="text"
              name="ownerPhone"
              id="ownerPhone"
              placeholder="Owner Phone"
              value={form.ownerPhone}
              onChange={handleChange}
              className="input w-full p-2 border border-gray-300 rounded-md"
              required={isRequired("ownerPhone")}
            />
          </div>
        </div>
      </section>

      {/* Vaccination Info - Conditionally rendered/required for completion */}
      <section className="mb-8">
        <h3 className="text-xl font-medium text-gray-700 mb-4">
          Vaccination Info
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="vaccineName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Vaccine Name{" "}
              {isRequired("vaccineName") && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <input
              type="text"
              name="vaccineName"
              id="vaccineName"
              placeholder="Vaccine Name"
              value={form.vaccineName}
              onChange={handleChange}
              className="input w-full p-2 border border-gray-300 rounded-md"
              required={isRequired("vaccineName")}
            />
          </div>
          <div>
            <label
              htmlFor="dateAdministered"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date Administered{" "}
              {isRequired("dateAdministered") && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <input
              type="date"
              name="dateAdministered"
              id="dateAdministered"
              value={form.dateAdministered}
              onChange={handleChange}
              className="input w-full p-2 border border-gray-300 rounded-md"
              required={isRequired("dateAdministered")}
            />
          </div>
          <div>
            <label
              htmlFor="nextDueDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Next Due Date
            </label>
            <input
              type="date"
              name="nextDueDate"
              id="nextDueDate"
              value={form.nextDueDate}
              onChange={handleChange}
              className="input w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="batchNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Batch Number
            </label>
            <input
              type="text"
              name="batchNumber"
              id="batchNumber"
              placeholder="Batch Number"
              value={form.batchNumber}
              onChange={handleChange}
              className="input w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="manufacturer"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Manufacturer
            </label>
            <input
              type="text"
              name="manufacturer"
              id="manufacturer"
              placeholder="Manufacturer"
              value={form.manufacturer}
              onChange={handleChange}
              className="input w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Additional Notes
            </label>
            <textarea
              name="notes"
              id="notes"
              placeholder="Additional Notes"
              value={form.notes}
              onChange={handleChange}
              className="input min-h-[80px] w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-4">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow"
        >
          Save
        </button>
        <button
          onClick={onClose}
          className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
