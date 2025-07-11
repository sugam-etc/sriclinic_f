import React, { useState, useEffect } from "react";
import { surgeryService } from "../../../api/surgeryService";
import { patientService } from "../../../api/patientService";

export const AddSurgery = ({
  patientId,
  onSave,
  onCancel,
  existingSurgery,
}) => {
  const [formData, setFormData] = useState({
    surgeryType: "",
    surgeryDate: new Date().toISOString().split("T")[0],
    veterinarian: "",
    anesthesiaType: "",
    duration: "",
    complications: "",
    notes: "",
    followUpDate: "",
    medications: [],
  });

  const [medication, setMedication] = useState({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
  });

  const [patientData, setPatientData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        if (patientId) {
          const patient = await patientService.getPatientById(patientId);
          setPatientData(patient);
        }

        if (existingSurgery) {
          setFormData({
            ...existingSurgery,
            surgeryDate: existingSurgery.surgeryDate.split("T")[0],
            followUpDate: existingSurgery.followUpDate?.split("T")[0] || "",
            medications: existingSurgery.medications || [],
          });
        }
      } catch (err) {
        setSubmitError("Failed to load patient data");
        console.error("Load error:", err);
      }
    };

    loadData();
  }, [patientId, existingSurgery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleMedicationChange = (e) => {
    const { name, value } = e.target;
    setMedication({
      ...medication,
      [name]: value,
    });
  };

  const addMedication = () => {
    if (
      !medication.name ||
      !medication.dosage ||
      !medication.frequency ||
      !medication.duration
    ) {
      setErrors({
        ...errors,
        medications: "All medication fields are required",
      });
      return;
    }

    setFormData({
      ...formData,
      medications: [...formData.medications, medication],
    });
    setMedication({
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
    });
    setErrors((prev) => ({ ...prev, medications: "" }));
  };

  const removeMedication = (index) => {
    const updatedMedications = [...formData.medications];
    updatedMedications.splice(index, 1);
    setFormData({
      ...formData,
      medications: updatedMedications,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.surgeryType.trim()) {
      newErrors.surgeryType = "Surgery type is required";
    }
    if (!formData.surgeryDate) {
      newErrors.surgeryDate = "Surgery date is required";
    }
    if (!formData.veterinarian.trim()) {
      newErrors.veterinarian = "Veterinarian name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // Format dates properly for backend
      const submissionData = {
        ...formData,
        patientId: patientId, // Make sure this is included
        surgeryDate: new Date(formData.surgeryDate).toISOString(),
        followUpDate: formData.followUpDate
          ? new Date(formData.followUpDate).toISOString()
          : undefined,
        duration: formData.duration ? Number(formData.duration) : undefined,
        medications: formData.medications.map((med) => ({
          ...med,
          dosage: med.dosage.toString(),
          duration: med.duration.toString(),
        })),
      };

      await onSave(submissionData);
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError(
        error.message ||
          "Failed to save surgery. Please check your data and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {existingSurgery ? "Edit Surgery" : "Add New Surgery"}
      </h2>

      {(submitError || errors.submit) && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
          <p>{submitError || errors.submit}</p>
        </div>
      )}

      {patientData && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-2">Patient</h3>
          <p className="font-medium">{patientData.name}</p>
          <p className="text-sm text-gray-600">
            {patientData.species} • {patientData.breed} • {patientData.age}
          </p>
          <p className="text-sm text-gray-600">
            ID: {patientData.petId || "N/A"} | Reg:{" "}
            {patientData.registrationNumber}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Surgery Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Surgery Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="surgeryType"
              value={formData.surgeryType}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.surgeryType ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Spay, Neuter, ACL Repair"
            />
            {errors.surgeryType && (
              <p className="mt-1 text-sm text-red-600">{errors.surgeryType}</p>
            )}
          </div>

          {/* Surgery Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Surgery Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="surgeryDate"
              value={formData.surgeryDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.surgeryDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.surgeryDate && (
              <p className="mt-1 text-sm text-red-600">{errors.surgeryDate}</p>
            )}
          </div>

          {/* Veterinarian */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Veterinarian <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="veterinarian"
              value={formData.veterinarian}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.veterinarian ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Dr. Smith"
            />
            {errors.veterinarian && (
              <p className="mt-1 text-sm text-red-600">{errors.veterinarian}</p>
            )}
          </div>

          {/* Anesthesia Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anesthesia Type
            </label>
            <input
              type="text"
              name="anesthesiaType"
              value={formData.anesthesiaType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., Isoflurane, Propofol"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., 90"
              min="0"
            />
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follow-up Date
            </label>
            <input
              type="date"
              name="followUpDate"
              value={formData.followUpDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Complications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Complications
          </label>
          <textarea
            name="complications"
            value={formData.complications}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="2"
            placeholder="Describe any complications during surgery"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="3"
            placeholder="Additional notes about the surgery"
          />
        </div>

        {/* Medications Section */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            Medications
          </h3>

          {errors.medications && (
            <p className="text-sm text-red-600 mb-2">{errors.medications}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={medication.name}
                onChange={handleMedicationChange}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                placeholder="Medication name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Dosage <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="dosage"
                value={medication.dosage}
                onChange={handleMedicationChange}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                placeholder="e.g., 5mg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Frequency <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="frequency"
                value={medication.frequency}
                onChange={handleMedicationChange}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                placeholder="e.g., Twice daily"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Duration <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="duration"
                value={medication.duration}
                onChange={handleMedicationChange}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                placeholder="e.g., 7 days"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={addMedication}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors mb-4"
          >
            Add Medication
          </button>

          {/* List of added medications */}
          {formData.medications.length > 0 && (
            <div className="border rounded-md divide-y">
              {formData.medications.map((med, index) => (
                <div
                  key={index}
                  className="p-2 flex justify-between items-center"
                >
                  <div className="text-sm">
                    <span className="font-medium">{med.name}</span> -{" "}
                    {med.dosage}, {med.frequency} for {med.duration}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Surgery"}
          </button>
        </div>
      </form>
    </div>
  );
};
