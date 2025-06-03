import { useState, useEffect } from "react";
import {
  FaFileMedical,
  FaUser,
  FaCalendarAlt,
  FaTimes,
  FaPlus,
  FaPaw, // Icon for species/breed
  FaBirthdayCake, // Icon for age
  FaVenusMars, // Icon for sex
} from "react-icons/fa";
import {
  createMedicalRecord,
  updateMedicalRecord,
} from "../api/medicalRecordService.js"; // Corrected path assuming it's in a sibling 'api' folder

const MedicalRecordForm = ({
  record,
  setRecords,
  onCancel,
  appointmentData,
  onRecordSuccess,
}) => {
  // Initialize form data from record if editing, else default values
  // Includes all fields from Patient and MedicalRecord schemas
  const [formData, setFormData] = useState(() => {
    // Base default values
    const defaultFormData = {
      date: new Date().toISOString().split("T")[0],
      vetenarian: "Dr. Smith", // Default veterinarian
      diagnosis: "",
      treatment: "",
      notes: "",
      followUpDate: "", // Can be null or empty string

      // Patient fields (nested in 'patient' object for backend)
      patientName: "", // Maps to patient.name
      species: "", // Maps to patient.species (formerly patientType)
      age: "", // Maps to patient.age
      breed: "", // Maps to patient.breed
      petId: "", // Maps to patient.petId (Microchip No)
      sex: "", // Maps to patient.sex
      ownerName: "", // Maps to patient.ownerName
      ownerContact: "", // Maps to patient.ownerContact
      lastAppointment: "", // Maps to patient.lastAppointment
      nextAppointment: "", // Maps to patient.nextAppointment
    };

    // If 'record' is provided (for editing existing medical record)
    if (record) {
      return {
        ...defaultFormData,
        date: record.date
          ? new Date(record.date).toISOString().split("T")[0]
          : defaultFormData.date,
        vetenarian: record.vetenarian,
        diagnosis: record.diagnosis,
        treatment: record.treatment,
        notes: record.notes,
        followUpDate: record.followUpDate
          ? new Date(record.followUpDate).toISOString().slice(0, 16)
          : "",
        // Extract patient details if available and populated
        patientName: record.patient?.name || "",
        species: record.patient?.species || "",
        age: record.patient?.age || "",
        breed: record.patient?.breed || "",
        petId: record.patient?.petId || "",
        sex: record.patient?.sex || "",
        ownerName: record.patient?.ownerName || "",
        ownerContact: record.patient?.ownerContact || "",
        lastAppointment: record.patient?.lastAppointment
          ? new Date(record.patient.lastAppointment).toISOString().split("T")[0]
          : "",
        nextAppointment: record.patient?.nextAppointment
          ? new Date(record.patient.nextAppointment).toISOString().split("T")[0]
          : "",
      };
    }

    // If 'appointmentData' is provided (for creating new medical record from appointment)
    if (appointmentData) {
      return {
        ...defaultFormData,
        patientName: appointmentData.petName || "",
        species: appointmentData.petType || "",
        age: appointmentData.petAge || "",
        ownerName: appointmentData.clientName || "",
        ownerContact: appointmentData.contactNumber || "",
        vetenarian: appointmentData.vetName || defaultFormData.vetenarian,
        date: appointmentData.date
          ? new Date(appointmentData.date).toISOString().split("T")[0]
          : defaultFormData.date,
        notes: `Appointment Reason: ${appointmentData.reason || ""}`, // Pre-fill notes with appointment reason
        lastAppointment:
          new Date(appointmentData.date).toISOString().split("T")[0] || "", // Set last appointment to the current appointment date
      };
    }

    // If neither 'record' nor 'appointmentData' is provided, use default values
    return defaultFormData;
  });

  const [medicationsInputs, setMedicationsInputs] = useState(
    record?.medications?.length
      ? record.medications
      : [{ name: "", dosage: "", frequency: "", duration: "", quantity: 1 }]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Update formData.medications when medicationsInputs changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      medications: medicationsInputs,
    }));
  }, [medicationsInputs]);

  // Handle changes for main form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle changes for medication input fields
  const handleMedicationInputChange = (index, e) => {
    const { name, value } = e.target;
    setMedicationsInputs((prev) => {
      const newInputs = [...prev];
      newInputs[index] = { ...newInputs[index], [name]: value };
      return newInputs;
    });
  };

  // Add a new medication input row
  const addMedicationsInput = () => {
    setMedicationsInputs((prev) => [
      ...prev,
      { name: "", dosage: "", frequency: "", duration: "", quantity: 1 },
    ]);
  };

  // Remove a medication input row
  const removeMedicationsInput = (index) => {
    setMedicationsInputs((prev) => {
      const newInputs = [...prev];
      newInputs.splice(index, 1);
      // Ensure there's always at least one medication input row
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
      // Prepare the patient data object as expected by the backend controller
      const patientData = {
        name: formData.patientName,
        species: formData.species,
        age: formData.age,
        breed: formData.breed,
        petId: formData.petId,
        sex: formData.sex,
        ownerName: formData.ownerName,
        ownerContact: formData.ownerContact,
        // Only include optional date fields if they have values
        lastAppointment: formData.lastAppointment || undefined,
        nextAppointment: formData.nextAppointment || undefined,
      };

      // Prepare the medical record data object for the backend
      const recordData = {
        patient: patientData, // Send the patient object
        vetenarian: formData.vetenarian,
        date: formData.date,
        diagnosis: formData.diagnosis,
        treatment: formData.treatment,
        notes: formData.notes,
        // Only include optional date field if it has a value
        followUpDate: formData.followUpDate || undefined,
        // Filter out empty medication entries and ensure quantity is a number
        medications: medicationsInputs
          .filter(
            (med) =>
              med.name.trim() &&
              med.frequency.trim() &&
              med.duration.trim() &&
              Number(med.quantity) >= 1
          ) // Ensure all required medication fields are present
          .map((med) => ({
            ...med,
            quantity: Number(med.quantity) || 1, // Ensure quantity is a number, default to 1
          })),
      };

      console.log("Sending recordData for update/create:", recordData); // ADDED FOR DEBUGGING

      let response;
      if (record?._id) {
        // Update existing record if record._id is present
        response = await updateMedicalRecord(record._id, recordData);
        setRecords((prev) =>
          prev.map((r) => (r._id === record._id ? response.data : r))
        );
      } else {
        // Create new record
        response = await createMedicalRecord(recordData);
        // The backend returns { medicalRecord, patient }
        // We need to add the full medicalRecord to the state, ensuring 'patient' is an object
        const newRecordWithPopulatedPatient = {
          ...response.data.medicalRecord, // Access medicalRecord from response.data
          patient: response.data.patient, // Access patient from response.data
        };
        setRecords((prev) => [newRecordWithPopulatedPatient, ...prev]);

        // Call onRecordSuccess if it's provided (meaning it came from an appointment)
        if (onRecordSuccess && appointmentData?._id) {
          onRecordSuccess(appointmentData._id); // Pass the original appointment ID
        }
      }

      onCancel(); // Close the form after successful submission
    } catch (err) {
      console.error("Error saving medical record:", err);
      setError(err.response?.data?.message || "Failed to save record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 p-6 bg-gray-50 rounded-xl shadow-lg"
    >
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Information Section */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="species"
                  className="block text-lg font-medium text-gray-700 mb-1"
                >
                  Species *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaPaw className="text-gray-400" />
                  </span>
                  <input
                    type="text"
                    id="species"
                    name="species"
                    value={formData.species}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                    placeholder="e.g., Dog, Cat, Bird"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="age"
                  className="block text-lg font-medium text-gray-700 mb-1"
                >
                  Age *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaBirthdayCake className="text-gray-400" />
                  </span>
                  <input
                    type="text"
                    id="age"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                    placeholder="e.g., 5 years, 3 months"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="breed"
                  className="block text-lg font-medium text-gray-700 mb-1"
                >
                  Breed
                </label>
                <input
                  type="text"
                  id="breed"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
              </div>
              <div>
                <label
                  htmlFor="sex"
                  className="block text-lg font-medium text-gray-700 mb-1"
                >
                  Sex
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <FaVenusMars className="text-gray-400" />
                  </span>
                  <select
                    id="sex"
                    name="sex"
                    value={formData.sex}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg appearance-none"
                  >
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="petId"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Microchip No. / Pet ID
              </label>
              <input
                type="text"
                id="petId"
                name="petId"
                value={formData.petId}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
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
            <div>
              <label
                htmlFor="ownerContact"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Owner Contact *
              </label>
              <input
                type="text"
                id="ownerContact"
                name="ownerContact"
                value={formData.ownerContact}
                onChange={handleChange}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="lastAppointment"
                  className="block text-lg font-medium text-gray-700 mb-1"
                >
                  Last Appointment Date
                </label>
                <input
                  type="date"
                  id="lastAppointment"
                  name="lastAppointment"
                  value={formData.lastAppointment}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
              </div>
              <div>
                <label
                  htmlFor="nextAppointment"
                  className="block text-lg font-medium text-gray-700 mb-1"
                >
                  Next Appointment Date
                </label>
                <input
                  type="date"
                  id="nextAppointment"
                  name="nextAppointment"
                  value={formData.nextAppointment}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Visit Information Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-indigo-600" />
            Visit Information
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  Veterinarian *
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
            className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end mb-4 p-4 border border-gray-100 rounded-lg bg-gray-50"
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
                Dosage
              </label>
              <input
                type="text"
                id={`medDosage${index}`}
                name="dosage"
                value={med.dosage}
                onChange={(e) => handleMedicationInputChange(index, e)}
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
                className="self-start text-red-600 hover:text-red-800 text-xl p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
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
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
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
          className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          disabled={isSubmitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors duration-200"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Save Record"}
        </button>
      </div>
    </form>
  );
};

export default MedicalRecordForm;
