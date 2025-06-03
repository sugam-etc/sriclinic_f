import { useState, useEffect } from "react";
import {
  createVaccination,
  updateVaccination,
} from "../api/vaccinationService";

export default function VaccinationForm({ existing, onClose }) {
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
  });

  useEffect(() => {
    if (existing) setForm(existing);
  }, [existing]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (form._id) {
        await updateVaccination(form._id, form);
      } else {
        await createVaccination(form);
      }
      onClose();
    } catch (err) {
      console.error("Error saving vaccination:", err);
    }
  };

  return (
    <div className="bg-white max-w-4xl mx-auto p-6 rounded-2xl shadow-md border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {form._id ? "Edit Vaccination Record" : "New Vaccination Entry"}
      </h2>

      {/* Patient Info */}
      <section className="mb-8">
        <h3 className="text-xl font-medium text-gray-700 mb-4">Patient Info</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="patientName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Patient Name
            </label>
            <input
              type="text"
              name="patientName"
              id="patientName"
              placeholder="Patient Name"
              value={form.patientName}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label
              htmlFor="patientSpecies"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Species
            </label>
            <input
              type="text"
              name="patientSpecies"
              id="patientSpecies"
              placeholder="Species"
              value={form.patientSpecies}
              onChange={handleChange}
              className="input"
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
              className="input"
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
              className="input"
            />
          </div>
          <div>
            <label
              htmlFor="patientId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Patient ID
            </label>
            <input
              type="text"
              name="patientId"
              id="patientId"
              placeholder="Patient ID"
              value={form.patientId}
              onChange={handleChange}
              className="input"
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
              Owner Name
            </label>
            <input
              type="text"
              name="ownerName"
              id="ownerName"
              placeholder="Owner Name"
              value={form.ownerName}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label
              htmlFor="ownerPhone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Owner Phone
            </label>
            <input
              type="text"
              name="ownerPhone"
              id="ownerPhone"
              placeholder="Owner Phone"
              value={form.ownerPhone}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>
      </section>

      {/* Vaccination Info */}
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
              Vaccine Name
            </label>
            <input
              type="text"
              name="vaccineName"
              id="vaccineName"
              placeholder="Vaccine Name"
              value={form.vaccineName}
              onChange={handleChange}
              className="input"
            />
          </div>
          <div>
            <label
              htmlFor="dateAdministered"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Date Administered
            </label>
            <input
              type="date"
              name="dateAdministered"
              id="dateAdministered"
              value={form.dateAdministered?.slice(0, 10)}
              onChange={handleChange}
              className="input"
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
              value={form.nextDueDate?.slice(0, 10)}
              onChange={handleChange}
              className="input"
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
              className="input"
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
              className="input"
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
              className="input min-h-[80px]"
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
