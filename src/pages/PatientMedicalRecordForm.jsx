import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API } from "../config";

const PatientMedicalRecordForm = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const API_PATIENT_BASE = `${API}patients`;
  const API_MEDICAL_RECORD_BASE = `${API}medical-records`;

  // Form state
  const [formData, setFormData] = useState({
    // Patient fields
    name: "",
    species: "Canine",
    age: "",
    breed: "",
    sex: "UNKNOWN",
    petId: "",
    registrationNumber: "",
    ownerName: "",
    ownerContact: "",

    // Medical record fields
    veterinarian: "",
    weight: "",
    pulseRate: "",
    followUpDate: null,
    examination: [],
    diagnosis: [],
    treatmentPlan: [],
    clinicalSigns: [],
    progonosis: "",
    treatment: [],
    previousHistory: [],
    reason: "",
    clinicalFinding: [],
    conclusion: "",
    notes: "",
    advice: "",
    treatmentCompleted: false,
    medications: [],
    vaccinationStatus: {
      rabies: false,
      dhppil: false,
      corona: false,
      dewormed: false,
    },
    clinicalExamination: {
      temperature: "",
      respiration: "",
      pulse: "",
      mucousMembranes: "",
      skin: "",
      capillaryRefillTime: "",
      weight: "",
      bodyConditionScore: "",
      hydrationStatus: "Normal",
      otherFindings: "",
    },
    medicalRecordId: null,
  });

  const [currentMedication, setCurrentMedication] = useState({
    name: "",
    dosage: "",
    quantity: "",
    duration: "",
    frequency: "",
  });

  const [tempArrayItem, setTempArrayItem] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch patient data
        const patientResponse = await axios.get(
          `${API_PATIENT_BASE}/${patientId}`
        );
        const patient = patientResponse.data;

        // Fetch medical records for the patient
        const recordsResponse = await axios.get(
          `${API_MEDICAL_RECORD_BASE}/patient/${patientId}`
        );
        const records = recordsResponse.data;

        setFormData((prev) => ({
          ...prev,
          ...patient,
          ...(records[0] || {}),
          medicalRecordId: records[0]?._id || null,
          followUpDate: records[0]?.followUpDate
            ? new Date(records[0].followUpDate)
            : null,
          clinicalExamination: {
            ...prev.clinicalExamination,
            ...(records[0]?.clinicalExamination || {}),
          },
          vaccinationStatus: {
            ...prev.vaccinationStatus,
            ...(records[0]?.vaccinationStatus || {}),
          },
        }));
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(
          err.response?.data?.message || err.message || "Failed to fetch data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (patientId) {
      fetchData();
    }
  }, [patientId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.startsWith("vaccinationStatus.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        vaccinationStatus: {
          ...prev.vaccinationStatus,
          [field]: checked,
        },
      }));
    } else if (name.startsWith("clinicalExamination.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        clinicalExamination: {
          ...prev.clinicalExamination,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Handle date changes for the HTML date input
  const handleDateChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      followUpDate: value ? new Date(value) : null,
    }));
  };

  const handleMedicationChange = (e) => {
    const { name, value } = e.target;
    setCurrentMedication((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayChange = (field, value) => {
    setTempArrayItem(value);
  };

  const addArrayItem = (field) => {
    if (tempArrayItem.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], tempArrayItem],
      }));
      setTempArrayItem("");
    }
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const addMedication = () => {
    // Ensure all required medication fields are present before adding
    if (
      currentMedication.name &&
      currentMedication.dosage &&
      currentMedication.quantity &&
      currentMedication.duration &&
      currentMedication.frequency
    ) {
      setFormData((prev) => ({
        ...prev,
        medications: [...prev.medications, currentMedication],
      }));
      setCurrentMedication({
        name: "",
        dosage: "",
        quantity: "",
        duration: "",
        frequency: "",
      });
    } else {
      setError(
        "Please fill all required medication fields (Name, Dosage, Quantity, Duration, Frequency)."
      );
    }
  };

  const removeMedication = (index) => {
    setFormData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (patientId) {
        // Update existing patient
        await axios.put(`${API_PATIENT_BASE}/${patientId}`, {
          name: formData.name,
          species: formData.species,
          age: formData.age,
          breed: formData.breed,
          sex: formData.sex,
          petId: formData.petId,
          registrationNumber: formData.registrationNumber,
          ownerName: formData.ownerName,
          ownerContact: formData.ownerContact,
        });

        // Prepare medical record data
        const medicalRecordData = {
          veterinarian: formData.veterinarian,
          weight: formData.weight,
          pulseRate: formData.pulseRate,
          followUpDate: formData.followUpDate,
          examination: formData.examination,
          diagnosis: formData.diagnosis,
          treatmentPlan: formData.treatmentPlan,
          clinicalSigns: formData.clinicalSigns,
          progonosis: formData.progonosis,
          clinicalFinding: formData.clinicalFinding,
          treatment: formData.treatment,
          previousHistory: formData.previousHistory,

          reason: formData.reason,
          conclusion: formData.conclusion,
          notes: formData.notes,
          advice: formData.advice,
          treatmentCompleted: formData.treatmentCompleted,
          medications: formData.medications,
          vaccinationStatus: formData.vaccinationStatus,
          clinicalExamination: formData.clinicalExamination,
          petId: formData.petId,
          registrationNumber: formData.registrationNumber,
        };

        if (formData.medicalRecordId) {
          // Update existing medical record
          await axios.put(
            `${API_MEDICAL_RECORD_BASE}/${formData.medicalRecordId}`,
            medicalRecordData
          );
        } else {
          // Create new medical record
          await axios.post(API_MEDICAL_RECORD_BASE, medicalRecordData);
        }
        setSuccess("Patient and medical record updated successfully!");
      } else {
        let newPatient;
        try {
          // Try creating a patient (or get existing one)
          const response = await axios.post(API_PATIENT_BASE, {
            name: formData.name,
            species: formData.species,
            age: formData.age,
            breed: formData.breed,
            sex: formData.sex,
            petId: formData.petId,
            registrationNumber: formData.registrationNumber,
            ownerName: formData.ownerName,
            previousHistory: formData.previousHistory,
            ownerContact: formData.ownerContact,
          });
          newPatient = response.data;
        } catch (err) {
          // Handle duplicate patient by fetching them
          if (
            err.response &&
            err.response.status === 400 &&
            err.response.data.message.includes("already exists")
          ) {
            try {
              const fetchResponse = await axios.get(
                `${API_PATIENT_BASE}/identifier/${
                  formData.petId || formData.registrationNumber
                }`
              );
              newPatient = fetchResponse.data;
            } catch (fetchErr) {
              setError("Failed to retrieve existing patient");
              setIsLoading(false);
              return;
            }
          } else {
            setError(err.response?.data?.message || "Failed to create patient");
            setIsLoading(false);
            return;
          }
        }

        // Now create the medical record
        await axios.post(API_MEDICAL_RECORD_BASE, {
          ...formData,
          petId: newPatient.petId,
          registrationNumber: newPatient.registrationNumber,
        });

        setSuccess("Medical record added to existing patient!");
        navigate(`/patient/${newPatient._id}`);
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to save data"
      );
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {patientId ? "Edit" : "Create"} Patient and Medical Record
        </h2>
        {patientId && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            Patient ID: {patientId}
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <div className="flex justify-between">
            <p>{error}</p>
            <button onClick={() => setError(null)} className="text-red-700">
              ✖️
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
          <div className="flex justify-between">
            <p>{success}</p>
            <button onClick={() => setSuccess(null)} className="text-green-700">
              ✔️
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Details Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h3 className="text-lg font-medium text-white">Patient Details</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Species *
                </label>
                <select
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Canine">Canine</option>
                  <option value="Feline">Feline</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age *
                </label>
                <input
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breed
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sex
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="UNKNOWN">Unknown</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pet ID
                </label>
                <input
                  type="text"
                  name="petId"
                  value={formData.petId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Name *
                </label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner Contact *
                </label>
                <input
                  type="tel"
                  name="ownerContact"
                  value={formData.ownerContact}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Examination Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h3 className="text-lg font-medium text-white">
              Clinical Examination
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature (°C)
                </label>
                <input
                  type="text"
                  name="clinicalExamination.temperature"
                  value={formData.clinicalExamination.temperature}
                  onChange={handleChange}
                  placeholder="e.g., 38.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Respiration (per min)
                </label>
                <input
                  type="text"
                  name="clinicalExamination.respiration"
                  value={formData.clinicalExamination.respiration}
                  onChange={handleChange}
                  placeholder="e.g., 20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pulse (per min)
                </label>
                <input
                  type="text"
                  name="clinicalExamination.pulse"
                  value={formData.clinicalExamination.pulse}
                  onChange={handleChange}
                  placeholder="e.g., 80"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mucous Membranes
                </label>
                <input
                  type="text"
                  name="clinicalExamination.mucousMembranes"
                  value={formData.clinicalExamination.mucousMembranes}
                  onChange={handleChange}
                  placeholder="e.g., Pink, moist"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skin Condition
                </label>
                <input
                  type="text"
                  name="clinicalExamination.skin"
                  value={formData.clinicalExamination.skin}
                  onChange={handleChange}
                  placeholder="e.g., Normal, dry"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capillary Refill Time (sec)
                </label>
                <input
                  type="text"
                  name="clinicalExamination.capillaryRefillTime"
                  value={formData.clinicalExamination.capillaryRefillTime}
                  onChange={handleChange}
                  placeholder="e.g., 2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="text"
                  name="clinicalExamination.weight"
                  value={formData.clinicalExamination.weight}
                  onChange={handleChange}
                  placeholder="e.g., 12.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Body Condition Score (1-9)
                </label>
                <input
                  type="number"
                  min="1"
                  max="9"
                  name="clinicalExamination.bodyConditionScore"
                  value={formData.clinicalExamination.bodyConditionScore}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hydration Status
                </label>
                <select
                  name="clinicalExamination.hydrationStatus"
                  value={formData.clinicalExamination.hydrationStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Normal">Normal</option>
                  <option value="Dehydrated">Dehydrated</option>
                  <option value="Overhydrated">Overhydrated</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Findings
              </label>
              <textarea
                rows={2}
                name="clinicalExamination.otherFindings"
                value={formData.clinicalExamination.otherFindings}
                onChange={handleChange}
                placeholder="Any additional clinical findings"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clinical Signs
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tempArrayItem}
                  onChange={(e) =>
                    handleArrayChange("clinicalSigns", e.target.value)
                  }
                  placeholder="Add clinical signs"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => addArrayItem("clinicalSigns")}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ➕ Add
                </button>
              </div>
              {formData.clinicalSigns.length > 0 && (
                <ul className="space-y-2">
                  {formData.clinicalSigns.map((item, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem("clinicalSigns", index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clinical Finding
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tempArrayItem}
                  onChange={(e) =>
                    handleArrayChange("clinicalFinding", e.target.value)
                  }
                  placeholder="Add clinical findings"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => addArrayItem("clinicalFinding")}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ➕ Add
                </button>
              </div>
              {formData.clinicalFinding.length > 0 && (
                <ul className="space-y-2">
                  {formData.clinicalFinding.map((item, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() =>
                          removeArrayItem("clinicalFinding", index)
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* History and Vaccination Status Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h3 className="text-lg font-medium text-white">
              History and Vaccination Status
            </h3>
          </div>
          <div className="p-6">
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Previous History
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tempArrayItem}
                  onChange={(e) =>
                    handleArrayChange("previousHistory", e.target.value)
                  }
                  placeholder="Add previous history items"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => addArrayItem("previousHistory")}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ➕ Add
                </button>
              </div>
              {formData.previousHistory.length > 0 && (
                <ul className="space-y-2">
                  {formData.previousHistory.map((item, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() =>
                          removeArrayItem("previousHistory", index)
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-700 mb-2">
                Vaccination Status
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { id: "rabies", label: "Rabies" },
                  { id: "dhppil", label: "DHPPiL" },
                  { id: "corona", label: "Corona" },
                  { id: "dewormed", label: "Dewormed" },
                ].map(({ id, label }) => (
                  <div key={id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={id}
                      name={`vaccinationStatus.${id}`}
                      checked={formData.vaccinationStatus[id]}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={id}
                      className="ml-2 block text-sm text-gray-700"
                    >
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Diagnosis and Treatment Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h3 className="text-lg font-medium text-white">
              Diagnosis and Treatment
            </h3>
          </div>
          <div className="p-6">
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tempArrayItem}
                  onChange={(e) =>
                    handleArrayChange("diagnosis", e.target.value)
                  }
                  placeholder="Add diagnosis items"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => addArrayItem("diagnosis")}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ➕ Add
                </button>
              </div>
              {formData.diagnosis.length > 0 && (
                <ul className="space-y-2">
                  {formData.diagnosis.map((item, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem("diagnosis", index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment Plan
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tempArrayItem}
                  onChange={(e) =>
                    handleArrayChange("treatmentPlan", e.target.value)
                  }
                  placeholder="Add treatment plan items"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => addArrayItem("treatmentPlan")}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  ➕ Add
                </button>
              </div>
              {formData.treatmentPlan.length > 0 && (
                <ul className="space-y-2">
                  {formData.treatmentPlan.map((item, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem("treatmentPlan", index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progonosis *
              </label>
              <textarea
                rows={3}
                name="progonosis"
                value={formData.progonosis}
                onChange={handleChange}
                required
                placeholder="Enter your clinical conclusion"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conclusion *
              </label>
              <textarea
                rows={3}
                name="conclusion"
                value={formData.conclusion}
                onChange={handleChange}
                required
                placeholder="Enter your clinical conclusion"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Medications Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h3 className="text-lg font-medium text-white">Medications</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={currentMedication.name}
                  onChange={handleMedicationChange}
                  placeholder="Medication name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage *
                </label>
                <input
                  type="text"
                  name="dosage"
                  value={currentMedication.dosage}
                  onChange={handleMedicationChange}
                  placeholder="e.g., 5mg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  type="text"
                  name="quantity"
                  value={currentMedication.quantity}
                  onChange={handleMedicationChange}
                  placeholder="e.g., 30 tablets"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={currentMedication.duration}
                  onChange={handleMedicationChange}
                  placeholder="e.g., 7 days"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency *
                </label>
                <input
                  type="text"
                  name="frequency"
                  value={currentMedication.frequency}
                  onChange={handleMedicationChange}
                  placeholder="e.g., BID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addMedication}
                  disabled={
                    !currentMedication.name ||
                    !currentMedication.dosage ||
                    !currentMedication.quantity ||
                    !currentMedication.duration ||
                    !currentMedication.frequency
                  }
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ➕ Add
                </button>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-700 mb-2">
                Current Medications
              </h4>
              {formData.medications.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No medications added yet
                </p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {formData.medications.map((med, index) => (
                    <li
                      key={index}
                      className="py-3 flex justify-between items-center"
                    >
                      <div>
                        <span className="font-medium">{med.name}</span> -{" "}
                        {med.dosage}
                        {med.quantity && <>, Qty: {med.quantity}</>}
                        {med.duration && <>, Duration: {med.duration}</>}
                        {med.frequency && <>, Freq: {med.frequency}</>}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-blue-600 px-6 py-4">
            <h3 className="text-lg font-medium text-white">
              Additional Information
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Veterinarian *
                </label>
                <input
                  type="text"
                  name="veterinarian"
                  value={formData.veterinarian}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pulse Rate *
                </label>
                <input
                  type="text"
                  name="pulseRate"
                  value={formData.pulseRate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  name="followUpDate"
                  value={
                    formData.followUpDate
                      ? formData.followUpDate.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={handleDateChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Visit
              </label>
              <textarea
                rows={2}
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Describe the reason for the visit"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                rows={2}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Advice
              </label>
              <textarea
                rows={2}
                name="advice"
                value={formData.advice}
                onChange={handleChange}
                placeholder="Advice for the pet owner"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mt-4 flex items-center">
              <input
                type="checkbox"
                id="treatmentCompleted"
                name="treatmentCompleted"
                checked={formData.treatmentCompleted}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="treatmentCompleted"
                className="ml-2 block text-sm text-gray-700"
              >
                Treatment Completed
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() =>
              navigate(patientId ? `/patients/${patientId}` : "/patients")
            }
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            ❌ Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : <>💾 Save</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientMedicalRecordForm;
