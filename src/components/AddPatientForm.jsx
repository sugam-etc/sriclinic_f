import React, { useState, useEffect } from "react";
import { createPatient, updatePatient } from "../api/patientService"; // Import updatePatient

const AddPatientForm = ({ onPatientAdded, onCancel, patientToEdit }) => {
  const [form, setForm] = useState({
    name: "",
    species: "",
    breed: "",
    petId: "",
    age: "",
    sex: "",
    ownerName: "",
    ownerContact: "",
    lastAppointment: "",
    nextAppointment: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Effect to pre-fill the form if a patientToEdit is provided
  useEffect(() => {
    if (patientToEdit) {
      setForm({
        name: patientToEdit.name || "",
        species: patientToEdit.species || "",
        breed: patientToEdit.breed || "",
        petId: patientToEdit.petId || "",
        age: patientToEdit.age || "",
        sex: patientToEdit.sex || "",
        ownerName: patientToEdit.ownerName || "",
        ownerContact: patientToEdit.ownerContact || "",
        // Format dates for datetime-local input
        lastAppointment: patientToEdit.lastAppointment
          ? new Date(patientToEdit.lastAppointment).toISOString().slice(0, 16)
          : "",
        nextAppointment: patientToEdit.nextAppointment
          ? new Date(patientToEdit.nextAppointment).toISOString().slice(0, 16)
          : "",
      });
    } else {
      // Reset form if no patientToEdit (e.g., for adding a new patient)
      setForm({
        name: "",
        species: "",
        breed: "",
        petCode: "",
        age: "",
        sex: "",
        ownerName: "",
        ownerContact: "",
        lastAppointment: "",
        nextAppointment: "",
      });
    }
  }, [patientToEdit]); // Re-run when patientToEdit changes

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const patientData = {
        ...form,
        lastAppointment: form.lastAppointment || null,
        nextAppointment: form.nextAppointment || null,
      };

      let response;
      if (patientToEdit) {
        // If editing, call updatePatient
        response = await updatePatient(patientToEdit._id, patientData);
      } else {
        // If adding, call createPatient
        response = await createPatient(patientData);
      }

      onPatientAdded(response.data);
      onCancel(); // Close the form
    } catch (err) {
      console.error(
        `Failed to ${patientToEdit ? "update" : "add"} patient:`,
        err
      );
      setError(
        err.response?.data?.message ||
          `Failed to ${
            patientToEdit ? "update" : "add"
          } patient. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl shadow-lg max-w-4xl mx-auto p-8
                   space-y-8 transition-all"
    >
      <h2 className="text-3xl font-bold text-indigo-700 tracking-wide">
        {patientToEdit ? "Edit Patient" : "Add New Patient"}
      </h2>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Name */}
        <div className="flex flex-col">
          <label htmlFor="name" className="mb-2 font-semibold text-gray-700">
            Name<span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Patient's name"
            className="rounded-lg border border-gray-300 px-4 py-3
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400
              focus:border-indigo-400 transition duration-150"
          />
        </div>

        {/* Species */}
        <div className="flex flex-col">
          <label htmlFor="species" className="mb-2 font-semibold text-gray-700">
            Species<span className="text-red-500">*</span>
          </label>
          <input
            id="species"
            type="text"
            name="species"
            value={form.species}
            onChange={handleChange}
            required
            placeholder="Dog, Cat, etc."
            className="rounded-lg border border-gray-300 px-4 py-3
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400
              focus:border-indigo-400 transition duration-150"
          />
        </div>

        {/* Breed */}
        <div className="flex flex-col">
          <label htmlFor="breed" className="mb-2 font-semibold text-gray-700">
            Breed<span className="text-red-500">*</span>
          </label>
          <input
            id="breed"
            type="text"
            name="breed"
            value={form.breed}
            onChange={handleChange}
            required
            placeholder="Breed"
            className="rounded-lg border border-gray-300 px-4 py-3
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400
              focus:border-indigo-400 transition duration-150"
          />
        </div>
        {/* Age */}
        <div className="flex flex-col">
          <label htmlFor="age" className="mb-2 font-semibold text-gray-700">
            Age<span className="text-red-500">*</span>
          </label>
          <input
            id="age"
            type="text"
            name="age"
            value={form.age}
            onChange={handleChange}
            required
            placeholder="2 years, 3 months.. etc"
            className="rounded-lg border border-gray-300 px-4 py-3
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400
              focus:border-indigo-400 transition duration-150"
          />
        </div>

        {/* Pet Code */}
        <div className="flex flex-col">
          <label htmlFor="petId" className="mb-2 font-semibold text-gray-700">
            Microchip No.<span className="text-red-500">*</span>
          </label>
          <input
            id="petId"
            type="text"
            name="petId"
            value={form.petId}
            onChange={handleChange}
            required
            placeholder="Unique identifier"
            className="rounded-lg border border-gray-300 px-4 py-3
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400
              focus:border-indigo-400 transition duration-150"
          />
        </div>

        {/* Sex */}
        <div className="flex flex-col">
          <label htmlFor="sex" className="mb-2 font-semibold text-gray-700">
            Sex<span className="text-red-500">*</span>
          </label>
          <select
            id="sex"
            name="sex"
            value={form.sex}
            onChange={handleChange}
            required
            className="rounded-lg border border-gray-300 px-4 py-3
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400
              focus:border-indigo-400 transition duration-150"
          >
            <option value="" disabled>
              Select sex
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>

        {/* Owner Name */}
        <div className="flex flex-col">
          <label
            htmlFor="ownerName"
            className="mb-2 font-semibold text-gray-700"
          >
            Owner Name<span className="text-red-500">*</span>
          </label>
          <input
            id="ownerName"
            type="text"
            name="ownerName"
            value={form.ownerName}
            onChange={handleChange}
            required
            placeholder="Owner's full name"
            className="rounded-lg border border-gray-300 px-4 py-3
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400
              focus:border-indigo-400 transition duration-150"
          />
        </div>

        {/* Owner Contact */}
        <div className="flex flex-col">
          <label
            htmlFor="ownerContact"
            className="mb-2 font-semibold text-gray-700"
          >
            Owner Contact<span className="text-red-500">*</span>
          </label>
          <input
            id="ownerContact"
            type="tel"
            name="ownerContact"
            value={form.ownerContact}
            onChange={handleChange}
            required
            placeholder="Phone or email"
            className="rounded-lg border border-gray-300 px-4 py-3
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400
              focus:border-indigo-400 transition duration-150"
          />
        </div>

        {/* Last Appointment */}
        <div className="flex flex-col">
          <label
            htmlFor="lastAppointment"
            className="mb-2 font-semibold text-gray-700"
          >
            Last Appointment
          </label>
          <input
            id="lastAppointment"
            type="datetime-local"
            name="lastAppointment"
            value={form.lastAppointment}
            onChange={handleChange}
            className="rounded-lg border border-gray-300 px-4 py-3
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400
              focus:border-indigo-400 transition duration-150"
          />
        </div>

        {/* Next Appointment */}
        <div className="flex flex-col">
          <label
            htmlFor="nextAppointment"
            className="mb-2 font-semibold text-gray-700"
          >
            Next Appointment
          </label>
          <input
            id="nextAppointment"
            type="datetime-local"
            name="nextAppointment"
            value={form.nextAppointment}
            onChange={handleChange}
            className="rounded-lg border border-gray-300 px-4 py-3
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400
              focus:border-indigo-400 transition duration-150"
          />
        </div>
      </div>

      <div className="flex justify-end gap-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-6 py-3 text-white rounded-lg font-semibold ${
            isSubmitting ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"
          } transition`}
        >
          {isSubmitting
            ? patientToEdit
              ? "Updating..."
              : "Saving..."
            : patientToEdit
            ? "Update Patient"
            : "Add Patient"}
        </button>
      </div>
    </form>
  );
};

export default AddPatientForm;
