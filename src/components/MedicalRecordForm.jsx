import { useState, useEffect } from "react";
import {
  FaFileMedical,
  FaUser,
  FaCalendarAlt,
  FaTimes,
  FaPlus,
} from "react-icons/fa";
import {
  createMedicalRecord,
  updateMedicalRecord,
} from "../api/medicalRecordService.js";

const MedicalRecordForm = ({ record, setRecords, onCancel }) => {
  // Initialize form data from record if editing, else default values
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    patientId: "",
    patientName: "",
    patientType: "",
    ownerName: "",
    vetenarian: "Dr. Smith",
    diagnosis: "",
    treatment: "",
    medications: [],
    notes: "",
    followUpDate: "",
    status: "active",
    ...record,
  });

  const [medicationsInputs, setMedicationsInputs] = useState(
    record?.medications?.length
      ? record.medications
      : [{ name: "", dosage: "", frequency: "", duration: "", quantity: 1 }]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      medications: medicationsInputs,
    }));
  }, [medicationsInputs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMedicationInputChange = (index, e) => {
    const { name, value } = e.target;
    setMedicationsInputs((prev) => {
      const newInputs = [...prev];
      newInputs[index] = { ...newInputs[index], [name]: value };
      return newInputs;
    });
  };

  const addMedicationsInput = () => {
    setMedicationsInputs((prev) => [
      ...prev,
      { name: "", dosage: "", frequency: "", duration: "", quantity: 1 },
    ]);
  };

  const removeMedicationsInput = (index) => {
    setMedicationsInputs((prev) => {
      const newInputs = [...prev];
      newInputs.splice(index, 1);
      return newInputs.length
        ? newInputs
        : [{ name: "", dosage: "", frequency: "", duration: "", quantity: 1 }];
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare the data to match the backend model
      const recordData = {
        patientId: formData.patientId,
        patientName: formData.patientName,
        patientType: formData.patientType,
        ownerName: formData.ownerName,
        vetenarian: formData.vetenarian,
        date: formData.date,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        notes: formData.notes,
        followUpDate: formData.followUpDate,
        medications: medicationsInputs
          .filter((med) => med.name.trim() && med.dosage.trim())
          .map((med) => ({
            ...med,
            quantity: Number(med.quantity) || 1,
          })),
      };

      if (record?._id) {
        // Update existing record
        const response = await updateMedicalRecord(record._id, recordData);
        setRecords((prev) =>
          prev.map((r) => (r._id === record._id ? response.data : r))
        );
      } else {
        // Create new record
        const response = await createMedicalRecord(recordData);
        setRecords((prev) => [response.data, ...prev]);
      }

      onCancel();
    } catch (err) {
      console.error("Error saving medical record:", err);
      setError(err.response?.data?.message || "Failed to save record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaUser className="text-indigo-600" />
            Patient Information
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="patientName"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Patient Name *
              </label>
              <input
                type="text"
                id="patientName"
                name="patientName"
                value={formData.patientName}
                onChange={handleChange}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="patientType"
                  className="block text-lg font-medium text-gray-700 mb-1"
                >
                  Patient Type *
                </label>

                <input
                  id="patientType"
                  name="patientType"
                  value={formData.patientType}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
              </div>

              <div>
                <label
                  htmlFor="patientId"
                  className="block text-lg font-medium text-gray-700 mb-1"
                >
                  Patient ID
                </label>
                <input
                  type="text"
                  id="patientId"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="ownerName"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Owner Name *
              </label>
              <input
                type="text"
                id="ownerName"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>
          </div>
        </div>

        {/* Visit Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-indigo-600" />
            Visit Information
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="date"
                  className="block text-lg font-medium text-gray-700 mb-1"
                >
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
              </div>

              <div>
                <label
                  htmlFor="vetenarian"
                  className="block text-lg font-medium text-gray-700 mb-1"
                >
                  vetenarian *
                </label>
                <input
                  type="text"
                  id="vetenarian"
                  name="vetenarian"
                  value={formData.vetenarian}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="diagnosis"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Diagnosis *
              </label>
              <textarea
                id="diagnosis"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                rows={3}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>

            <div>
              <label
                htmlFor="treatment"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Treatment
              </label>
              <textarea
                id="treatment"
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                rows={3}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Medications Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaFileMedical className="text-indigo-600" />
          Medications
        </h2>

        {medicationsInputs.map((med, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end mb-4"
          >
            <div>
              <label
                htmlFor={`medName${index}`}
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Name *
              </label>
              <input
                type="text"
                id={`medName${index}`}
                name="name"
                value={med.name}
                onChange={(e) => handleMedicationInputChange(index, e)}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>

            <div>
              <label
                htmlFor={`medDosage${index}`}
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Dosage *
              </label>
              <input
                type="text"
                id={`medDosage${index}`}
                name="dosage"
                value={med.dosage}
                onChange={(e) => handleMedicationInputChange(index, e)}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>

            <div>
              <label
                htmlFor={`medQuantity${index}`}
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Quantity *
              </label>
              <input
                type="number"
                id={`medQuantity${index}`}
                name="quantity"
                min="1"
                value={med.quantity}
                onChange={(e) => handleMedicationInputChange(index, e)}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>

            <div>
              <label
                htmlFor={`medFrequency${index}`}
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Frequency *
              </label>
              <input
                type="text"
                id={`medFrequency${index}`}
                name="frequency"
                value={med.frequency}
                onChange={(e) => handleMedicationInputChange(index, e)}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>

            <div>
              <label
                htmlFor={`medDuration${index}`}
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Duration *
              </label>
              <input
                type="text"
                id={`medDuration${index}`}
                name="duration"
                value={med.duration}
                onChange={(e) => handleMedicationInputChange(index, e)}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => removeMedicationsInput(index)}
                className="self-start text-red-600 hover:text-red-800 text-xl"
                title="Remove medication"
                aria-label="Remove medication"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addMedicationsInput}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md"
        >
          <FaPlus /> Add Medication
        </button>
      </div>

      {/* Additional Notes, Follow-up */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
        <div>
          <label
            htmlFor="notes"
            className="block text-lg font-medium text-gray-700 mb-1"
          >
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
          />
        </div>

        <div>
          <label
            htmlFor="followUpDate"
            className="block text-lg font-medium text-gray-700 mb-1"
          >
            Follow-up Date
          </label>
          <input
            type="datetime-local"
            id="followUpDate"
            name="followUpDate"
            value={formData.followUpDate}
            onChange={handleChange}
            className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
          />
        </div>
      </div>

      {/* Form Buttons */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Record"}
        </button>
      </div>
    </form>
  );
};

export default MedicalRecordForm;
