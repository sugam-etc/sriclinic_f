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
  FaClipboardList, // Icon for examination
  FaHistory, // New icon for previous history
  FaHeartbeat, // Icon for vitals
  FaFileImage, // Icon for diagnosis imaging
  FaLightbulb, // Icon for advice
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
      notes: "",
      followUpDate: "", // Can be null or empty string
      reason: "",
      advice: "",

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

      // Array fields - these will be managed by separate states and merged on submit
      examination: [],
      previousHistory: [],
      vitals: [],
      diagnosisImaging: [],
      diagnosis: [], // Changed to array
      treatment: [], // Changed to array
      medications: [], // Ensure this is initialized as an empty array
    };

    // If 'record' is provided (for editing existing medical record)
    if (record) {
      return {
        ...defaultFormData,
        date: record.date
          ? new Date(record.date).toISOString().split("T")[0]
          : defaultFormData.date,
        vetenarian: record.vetenarian,
        notes: record.notes,
        followUpDate: record.followUpDate
          ? new Date(record.followUpDate).toISOString().slice(0, 16) // Use slice for datetime-local
          : "",
        reason: record.reason || "",
        advice: record.advice || "",

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
        // Array fields will be populated by dedicated useEffects below based on record prop
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
        // No array fields from appointment, so they remain default empty arrays
      };
    }

    // If neither 'record' nor 'appointmentData' is provided, use default values
    return defaultFormData;
  });

  // State for medications (nested array of objects)
  const [medicationsInputs, setMedicationsInputs] = useState(
    Array.isArray(record?.medications)
      ? record.medications
      : [{ name: "", dosage: "", frequency: "", duration: "", quantity: "1" }] // quantity is now a string
  );

  // State for examination findings (array of strings)
  const [examinationInputs, setExaminationInputs] = useState(
    Array.isArray(record?.examination) ? record.examination : []
  );
  const [currentExaminationInput, setCurrentExaminationInput] = useState("");

  // State for previous history findings (array of strings)
  const [previousHistoryInputs, setPreviousHistoryInputs] = useState(
    Array.isArray(record?.previousHistory) ? record.previousHistory : []
  );
  const [currentPreviousHistoryInput, setCurrentPreviousHistoryInput] =
    useState("");

  // State for vitals (array of strings)
  const [vitalsInputs, setVitalsInputs] = useState(
    Array.isArray(record?.vitals) ? record.vitals : []
  );
  const [currentVitalsInput, setCurrentVitalsInput] = useState("");

  // State for diagnosis imaging (array of strings)
  const [diagnosisImagingInputs, setDiagnosisImagingInputs] = useState(
    Array.isArray(record?.diagnosisImaging) ? record.diagnosisImaging : []
  );
  const [currentDiagnosisImagingInput, setCurrentDiagnosisImagingInput] =
    useState("");

  // State for diagnosis (array of strings) - **FIXED INITIALIZATION**
  const [diagnosisInputs, setDiagnosisInputs] = useState(
    Array.isArray(record?.diagnosis)
      ? record.diagnosis
      : record?.diagnosis // If it's a string from old data
      ? [record.diagnosis] // Wrap it in an array
      : [] // Otherwise, empty array
  );
  const [currentDiagnosisInput, setCurrentDiagnosisInput] = useState("");

  // State for treatment (array of strings) - **FIXED INITIALIZATION**
  const [treatmentInputs, setTreatmentInputs] = useState(
    Array.isArray(record?.treatment)
      ? record.treatment
      : record?.treatment // If it's a string from old data
      ? [record.treatment] // Wrap it in an array
      : [] // Otherwise, empty array
  );
  const [currentTreatmentInput, setCurrentTreatmentInput] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // --- useEffects to synchronize local array states with 'record' prop changes ---
  useEffect(() => {
    setMedicationsInputs(
      Array.isArray(record?.medications)
        ? record.medications
        : [{ name: "", dosage: "", frequency: "", duration: "", quantity: "1" }]
    );
  }, [record?.medications]);

  useEffect(() => {
    setExaminationInputs(
      Array.isArray(record?.examination) ? record.examination : []
    );
  }, [record?.examination]);

  useEffect(() => {
    setPreviousHistoryInputs(
      Array.isArray(record?.previousHistory) ? record.previousHistory : []
    );
  }, [record?.previousHistory]);

  useEffect(() => {
    setVitalsInputs(Array.isArray(record?.vitals) ? record.vitals : []);
  }, [record?.vitals]);

  useEffect(() => {
    setDiagnosisImagingInputs(
      Array.isArray(record?.diagnosisImaging) ? record.diagnosisImaging : []
    );
  }, [record?.diagnosisImaging]);

  useEffect(() => {
    setDiagnosisInputs(
      Array.isArray(record?.diagnosis)
        ? record.diagnosis
        : record?.diagnosis
        ? [record.diagnosis]
        : []
    );
  }, [record?.diagnosis]);

  useEffect(() => {
    setTreatmentInputs(
      Array.isArray(record?.treatment)
        ? record.treatment
        : record?.treatment
        ? [record.treatment]
        : []
    );
  }, [record?.treatment]);

  // --- End of useEffects for synchronization ---

  // Handle changes for main form fields (patient info, date, vetenarian, notes, followUpDate, reason, advice)
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
      { name: "", dosage: "", frequency: "", duration: "", quantity: "1" }, // quantity is now a string
    ]);
  };

  // Remove a medication input row
  const removeMedicationsInput = (index) => {
    setMedicationsInputs((prev) => {
      const newInputs = [...prev];
      newInputs.splice(index, 1);
      // Ensure there's always at least one medication input row if no initial data
      return newInputs.length
        ? newInputs
        : [
            {
              name: "",
              dosage: "",
              frequency: "",
              duration: "",
              quantity: "1",
            },
          ];
    });
  };

  // Generic handlers for array string fields (examination, previousHistory, vitals, diagnosisImaging, diagnosis, treatment)
  const createArrayInputHandlers = (setter, currentInputSetter) => {
    const handleInputChange = (e) => {
      currentInputSetter(e.target.value);
    };

    const addInput = (currentInputValue) => {
      if (currentInputValue.trim()) {
        setter((prev) => [...prev, currentInputValue.trim()]);
        currentInputSetter(""); // Clear the input field
      }
    };

    const removeInput = (index) => {
      setter((prev) => prev.filter((_, i) => i !== index));
    };

    return { handleInputChange, addInput, removeInput };
  };

  const {
    handleInputChange: handleCurrentExaminationInputChange,
    addInput: addExaminationInput,
    removeInput: removeExaminationInput,
  } = createArrayInputHandlers(
    setExaminationInputs,
    setCurrentExaminationInput
  );

  const {
    handleInputChange: handleCurrentPreviousHistoryInputChange,
    addInput: addPreviousHistoryInput,
    removeInput: removePreviousHistoryInput,
  } = createArrayInputHandlers(
    setPreviousHistoryInputs,
    setCurrentPreviousHistoryInput
  );

  const {
    handleInputChange: handleCurrentVitalsInputChange,
    addInput: addVitalsInput,
    removeInput: removeVitalsInput,
  } = createArrayInputHandlers(setVitalsInputs, setCurrentVitalsInput);

  const {
    handleInputChange: handleCurrentDiagnosisImagingInputChange,
    addInput: addDiagnosisImagingInput,
    removeInput: removeDiagnosisImagingInput,
  } = createArrayInputHandlers(
    setDiagnosisImagingInputs,
    setCurrentDiagnosisImagingInput
  );

  // Handlers for diagnosis array field
  const {
    handleInputChange: handleCurrentDiagnosisInput,
    addInput: addDiagnosisInput,
    removeInput: removeDiagnosisInput,
  } = createArrayInputHandlers(setDiagnosisInputs, setCurrentDiagnosisInput);

  // Handlers for treatment array field
  const {
    handleInputChange: handleCurrentTreatmentInput,
    addInput: addTreatmentInput,
    removeInput: removeTreatmentInput,
  } = createArrayInputHandlers(setTreatmentInputs, setCurrentTreatmentInput);

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
        // medicalHistory is handled by the backend, not directly set from this form
      };

      // Prepare the medical record data object for the backend
      const recordData = {
        patient: patientData, // Send the patient object
        vetenarian: formData.vetenarian,
        date: formData.date,
        diagnosis: diagnosisInputs.filter((item) => item.trim()), // Now an array
        reason: formData.reason,
        treatment: treatmentInputs.filter((item) => item.trim()), // Now an array
        notes: formData.notes,
        advice: formData.advice,
        // Only include optional date field if it has a value
        followUpDate: formData.followUpDate || undefined,
        // Filter out empty medication entries and ensure quantity is a string
        medications: medicationsInputs
          .filter(
            (med) =>
              med.name.trim() &&
              med.frequency.trim() &&
              med.duration.trim() &&
              med.quantity.trim() // Ensure quantity is a non-empty string
          )
          .map((med) => ({
            ...med,
            quantity: String(med.quantity), // Ensure quantity is a string
          })),
        // Include array findings, filtering out empty strings
        examination: examinationInputs.filter((item) => item.trim()),
        previousHistory: previousHistoryInputs.filter((item) => item.trim()),
        vitals: vitalsInputs.filter((item) => item.trim()),
        diagnosisImaging: diagnosisImagingInputs.filter((item) => item.trim()),
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

            {/* Diagnosis Section (now array) */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaClipboardList className="text-indigo-600" />
                Diagnosis *
              </h3>
              {diagnosisInputs.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <span className="text-lg text-gray-800">{entry}</span>
                  <button
                    type="button"
                    onClick={() => removeDiagnosisInput(index)}
                    className="text-red-600 hover:text-red-800 text-xl p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                    title="Remove diagnosis entry"
                    aria-label="Remove diagnosis entry"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Add diagnosis entry (e.g., 'Canine Parvovirus', 'Ear Infection')"
                  value={currentDiagnosisInput}
                  onChange={handleCurrentDiagnosisInput}
                  className="block flex-grow px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                  required={diagnosisInputs.length === 0} // Make required if no entries exist
                />
                <button
                  type="button"
                  onClick={() => addDiagnosisInput(currentDiagnosisInput)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                >
                  <FaPlus /> Add Entry
                </button>
              </div>
            </div>

            {/* Reason for Visit */}
            <div>
              <label
                htmlFor="reason"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Reason for Visit
              </label>
              <textarea
                id="reason"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={3}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>

            {/* Treatment Section (now array) */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaFileMedical className="text-indigo-600" />
                Treatment
              </h3>
              {treatmentInputs.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <span className="text-lg text-gray-800">{entry}</span>
                  <button
                    type="button"
                    onClick={() => removeTreatmentInput(index)}
                    className="text-red-600 hover:text-red-800 text-xl p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                    title="Remove treatment entry"
                    aria-label="Remove treatment entry"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Add treatment entry (e.g., 'Fluid therapy', 'Antibiotics')"
                  value={currentTreatmentInput}
                  onChange={handleCurrentTreatmentInput}
                  className="block flex-grow px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
                <button
                  type="button"
                  onClick={() => addTreatmentInput(currentTreatmentInput)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                >
                  <FaPlus /> Add Entry
                </button>
              </div>
            </div>

            {/* Previous History Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaHistory className="text-indigo-600" />
                Previous History (as described by owner)
              </h3>
              {previousHistoryInputs.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <span className="text-lg text-gray-800">{entry}</span>
                  <button
                    type="button"
                    onClick={() => removePreviousHistoryInput(index)}
                    className="text-red-600 hover:text-red-800 text-xl p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                    title="Remove history entry"
                    aria-label="Remove previous history entry"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Add previous history entry"
                  value={currentPreviousHistoryInput}
                  onChange={handleCurrentPreviousHistoryInputChange}
                  className="block flex-grow px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
                <button
                  type="button"
                  onClick={() =>
                    addPreviousHistoryInput(currentPreviousHistoryInput)
                  }
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                >
                  <FaPlus /> Add Entry
                </button>
              </div>
            </div>

            {/* Vitals Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaHeartbeat className="text-indigo-600" />
                Vitals
              </h3>
              {vitalsInputs.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <span className="text-lg text-gray-800">{entry}</span>
                  <button
                    type="button"
                    onClick={() => removeVitalsInput(index)}
                    className="text-red-600 hover:text-red-800 text-xl p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                    title="Remove vital entry"
                    aria-label="Remove vital entry"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Add vital reading (e.g., 'Temp: 101.5F', 'HR: 120 bpm')"
                  value={currentVitalsInput}
                  onChange={handleCurrentVitalsInputChange}
                  className="block flex-grow px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
                <button
                  type="button"
                  onClick={() => addVitalsInput(currentVitalsInput)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                >
                  <FaPlus /> Add Vital
                </button>
              </div>
            </div>

            {/* Diagnosis Imaging Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaFileImage className="text-indigo-600" />
                Diagnosis Imaging
              </h3>
              {diagnosisImagingInputs.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <span className="text-lg text-gray-800">{entry}</span>
                  <button
                    type="button"
                    onClick={() => removeDiagnosisImagingInput(index)}
                    className="text-red-600 hover:text-red-800 text-xl p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                    title="Remove imaging entry"
                    aria-label="Remove diagnosis imaging entry"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Add imaging finding (e.g., 'X-ray: Lung mass', 'Ultrasound: Spleen normal')"
                  value={currentDiagnosisImagingInput}
                  onChange={handleCurrentDiagnosisImagingInputChange}
                  className="block flex-grow px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
                <button
                  type="button"
                  onClick={() =>
                    addDiagnosisImagingInput(currentDiagnosisImagingInput)
                  }
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                >
                  <FaPlus /> Add Imaging
                </button>
              </div>
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
                type="text" // Changed to text as per schema, though number input for UX is fine
                id={`medQuantity${index}`}
                name="quantity"
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

      {/* Examination Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaClipboardList className="text-indigo-600" />
          Examination Findings
        </h2>
        <div className="space-y-4">
          {examinationInputs.map((finding, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <span className="text-lg text-gray-800">{finding}</span>
              <button
                type="button"
                onClick={() => removeExaminationInput(index)}
                className="text-red-600 hover:text-red-800 text-xl p-2 rounded-full hover:bg-red-50 transition-colors duration-200"
                title="Remove finding"
                aria-label="Remove examination finding"
              >
                <FaTimes />
              </button>
            </div>
          ))}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Add new finding (e.g., 'Eyes clear', 'Heart murmur')"
              value={currentExaminationInput}
              onChange={handleCurrentExaminationInputChange}
              className="block flex-grow px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            />
            <button
              type="button"
              onClick={() => addExaminationInput(currentExaminationInput)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
            >
              <FaPlus /> Add Finding
            </button>
          </div>
        </div>
      </div>

      {/* Additional Notes, Follow-up, and Advice */}
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

        {/* Advice */}
        <div>
          <label
            htmlFor="advice"
            className="block text-lg font-medium text-gray-700 mb-1"
          >
            Advice
          </label>
          <textarea
            id="advice"
            name="advice"
            value={formData.advice}
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
