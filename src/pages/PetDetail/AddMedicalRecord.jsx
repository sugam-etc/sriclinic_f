import { useState } from "react";
import { formatDate } from "./BasicPetInfo";

export const AddMedicalRecord = ({ petId, onSave, onCancel }) => {
  const [recordData, setRecordData] = useState({
    date: new Date().toISOString(),
    veterinarian: "",
    reason: "",
    examination: [],
    diagnosis: [],
    treatment: [],
    pulseRate: "",
    conclusion: "",
    progonosis: "",
    clinicalSigns: [],
    clinicalFinding: [],
    followUpDate: "",
    notes: "",
    advice: "",
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
    treatmentPlan: [],
    previousHistory: [],
    treatmentCompleted: false,
  });

  const [currentExamination, setCurrentExamination] = useState("");
  const [currentDiagnosis, setCurrentDiagnosis] = useState("");
  const [currentTreatment, setCurrentTreatment] = useState("");
  const [currentClinicalSign, setCurrentClinicalSign] = useState("");
  const [currentClinicalFinding, setCurrentClinicalFinding] = useState("");
  const [currentTreatmentPlan, setCurrentTreatmentPlan] = useState("");
  const [currentPreviousHistory, setCurrentPreviousHistory] = useState("");
  const [currentMedication, setCurrentMedication] = useState({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    quantity: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVaccinationChange = (e) => {
    const { name, checked } = e.target;
    setRecordData((prev) => ({
      ...prev,
      vaccinationStatus: {
        ...prev.vaccinationStatus,
        [name]: checked,
      },
    }));
  };

  const handleClinicalExamChange = (e) => {
    const { name, value } = e.target;
    setRecordData((prev) => ({
      ...prev,
      clinicalExamination: {
        ...prev.clinicalExamination,
        [name]: value,
      },
    }));
  };

  const handleArrayAdd = (field, currentValue, setCurrentValue) => {
    if (currentValue.trim()) {
      setRecordData((prev) => ({
        ...prev,
        [field]: [...prev[field], currentValue.trim()],
      }));
      setCurrentValue("");
    }
  };

  const handleArrayRemove = (field, index) => {
    setRecordData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleMedicationAdd = () => {
    if (currentMedication.name.trim()) {
      setRecordData((prev) => ({
        ...prev,
        medications: [...prev.medications, currentMedication],
      }));
      setCurrentMedication({
        name: "",
        dosage: "",
        frequency: "",
        duration: "",
        quantity: "",
      });
    }
  };

  const handleMedicationRemove = (index) => {
    setRecordData((prev) => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare data with all required fields
    const submissionData = {
      ...recordData,
      patient: petId,
      weight: recordData.clinicalExamination.weight,
      clinicalExamination: {
        ...recordData.clinicalExamination,
        weight: recordData.clinicalExamination.weight,
      },
    };

    onSave(petId, submissionData);
  };

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200";
  const buttonClass =
    "px-6 py-2 rounded-lg shadow-md transition-all duration-200";
  const sectionHeaderClass =
    "text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200";
  const sectionContainerClass =
    "space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100";

  return (
    <div className="bg-gray-50 rounded-xl shadow-lg p-8 border border-gray-100 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
        Add New Medical Record
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Visit Information */}
          <div className={sectionContainerClass}>
            <h3 className={sectionHeaderClass}>Visit Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="date"
                  value={formatDate(recordData.date, "yyyy-MM-dd'T'HH:mm")}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Veterinarian <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="veterinarian"
                  value={recordData.veterinarian}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  placeholder="Dr. Alex Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Visit
                </label>
                <input
                  type="text"
                  name="reason"
                  value={recordData.reason}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Annual checkup, vaccination, injury"
                />
              </div>
            </div>
          </div>

          {/* Clinical Examination */}
          <div className={sectionContainerClass}>
            <h3 className={sectionHeaderClass}>Clinical Examination</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="weight"
                  value={recordData.clinicalExamination.weight}
                  onChange={handleClinicalExamChange}
                  className={inputClass}
                  required
                  step="0.1"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pulse Rate (bpm) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pulseRate"
                  value={recordData.pulseRate}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  placeholder="e.g., 120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature (°C)
                </label>
                <input
                  type="text"
                  name="temperature"
                  value={recordData.clinicalExamination.temperature}
                  onChange={handleClinicalExamChange}
                  className={inputClass}
                  placeholder="e.g., 38.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Respiration
                </label>
                <input
                  type="text"
                  name="respiration"
                  value={recordData.clinicalExamination.respiration}
                  onChange={handleClinicalExamChange}
                  className={inputClass}
                  placeholder="e.g., 20 breaths/min"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hydration Status
                </label>
                <select
                  name="hydrationStatus"
                  value={recordData.clinicalExamination.hydrationStatus}
                  onChange={handleClinicalExamChange}
                  className={inputClass}
                >
                  <option value="Normal">Normal</option>
                  <option value="Dehydrated">Dehydrated</option>
                  <option value="Overhydrated">Overhydrated</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mucous Membranes
                </label>
                <input
                  type="text"
                  name="mucousMembranes"
                  value={recordData.clinicalExamination.mucousMembranes}
                  onChange={handleClinicalExamChange}
                  className={inputClass}
                  placeholder="e.g., Pink, moist"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capillary Refill Time
                </label>
                <input
                  type="text"
                  name="capillaryRefillTime"
                  value={recordData.clinicalExamination.capillaryRefillTime}
                  onChange={handleClinicalExamChange}
                  className={inputClass}
                  placeholder="e.g., <2 seconds"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Body Condition Score (1-9)
                </label>
                <input
                  type="number"
                  name="bodyConditionScore"
                  value={recordData.clinicalExamination.bodyConditionScore}
                  onChange={handleClinicalExamChange}
                  className={inputClass}
                  min="1"
                  max="9"
                  placeholder="e.g., 5"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Findings
                </label>
                <textarea
                  name="otherFindings"
                  value={recordData.clinicalExamination.otherFindings}
                  onChange={handleClinicalExamChange}
                  rows="2"
                  className={inputClass}
                  placeholder="Any other relevant observations"
                />
              </div>
            </div>
          </div>

          {/* Examination */}
          <div className={sectionContainerClass}>
            <h3 className={sectionHeaderClass}>Examination Findings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Examination Items
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={currentExamination}
                  onChange={(e) => setCurrentExamination(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Add examination item"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleArrayAdd(
                      "examination",
                      currentExamination,
                      setCurrentExamination
                    )
                  }
                  className={`${buttonClass} bg-orange-500 text-white hover:bg-orange-600`}
                >
                  Add
                </button>
              </div>
              {recordData.examination.length > 0 && (
                <div className="mt-4 space-y-2">
                  {recordData.examination.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
                    >
                      <span className="text-sm text-gray-800">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleArrayRemove("examination", index)}
                        className="text-red-500 hover:text-red-700 text-lg transition-colors duration-200"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Diagnosis */}
          <div className={sectionContainerClass}>
            <h3 className={sectionHeaderClass}>
              Diagnosis <span className="text-red-500">*</span>
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis Items
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={currentDiagnosis}
                  onChange={(e) => setCurrentDiagnosis(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Add diagnosis"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleArrayAdd(
                      "diagnosis",
                      currentDiagnosis,
                      setCurrentDiagnosis
                    )
                  }
                  className={`${buttonClass} bg-orange-500 text-white hover:bg-orange-600`}
                >
                  Add
                </button>
              </div>
              {recordData.diagnosis.length > 0 && (
                <div className="mt-4 space-y-2">
                  {recordData.diagnosis.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
                    >
                      <span className="text-sm text-gray-800">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleArrayRemove("diagnosis", index)}
                        className="text-red-500 hover:text-red-700 text-lg transition-colors duration-200"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Treatment */}
          <div className={sectionContainerClass}>
            <h3 className={sectionHeaderClass}>Treatment</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment Items
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={currentTreatment}
                  onChange={(e) => setCurrentTreatment(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Add treatment"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleArrayAdd(
                      "treatment",
                      currentTreatment,
                      setCurrentTreatment
                    )
                  }
                  className={`${buttonClass} bg-orange-500 text-white hover:bg-orange-600`}
                >
                  Add
                </button>
              </div>
              {recordData.treatment.length > 0 && (
                <div className="mt-4 space-y-2">
                  {recordData.treatment.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
                    >
                      <span className="text-sm text-gray-800">{item}</span>
                      <button
                        type="button"
                        onClick={() => handleArrayRemove("treatment", index)}
                        className="text-red-500 hover:text-red-700 text-lg transition-colors duration-200"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Treatment Plan */}
          <div className={sectionContainerClass}>
            <h3 className={sectionHeaderClass}>
              Treatment Plan <span className="text-red-500">*</span>
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment Plan Items
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={currentTreatmentPlan}
                  onChange={(e) => setCurrentTreatmentPlan(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Add treatment plan item"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleArrayAdd(
                      "treatmentPlan",
                      currentTreatmentPlan,
                      setCurrentTreatmentPlan
                    )
                  }
                  className={`${buttonClass} bg-orange-500 text-white hover:bg-orange-600`}
                >
                  Add
                </button>
              </div>
              {recordData.treatmentPlan.length > 0 && (
                <div className="mt-4 space-y-2">
                  {recordData.treatmentPlan.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
                    >
                      <span className="text-sm text-gray-800">{item}</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleArrayRemove("treatmentPlan", index)
                        }
                        className="text-red-500 hover:text-red-700 text-lg transition-colors duration-200"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Clinical Finding */}
          <div className={sectionContainerClass}>
            <h3 className={sectionHeaderClass}>
              Clinical Finding <span className="text-red-500">*</span>
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clinical Finding
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={currentClinicalFinding}
                  onChange={(e) => setCurrentClinicalFinding(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Add clinical finding"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleArrayAdd(
                      "clinicalFinding",
                      currentClinicalFinding,
                      setCurrentClinicalFinding
                    )
                  }
                  className={`${buttonClass} bg-orange-500 text-white hover:bg-orange-600`}
                >
                  Add
                </button>
              </div>
              {recordData.clinicalFinding.length > 0 && (
                <div className="mt-4 space-y-2">
                  {recordData.clinicalFinding.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
                    >
                      <span className="text-sm text-gray-800">{item}</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleArrayRemove("clinicalFinding", index)
                        }
                        className="text-red-500 hover:text-red-700 text-lg transition-colors duration-200"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Clinical Sign */}
          <div className={sectionContainerClass}>
            <h3 className={sectionHeaderClass}>
              Clinical Sign <span className="text-red-500">*</span>
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clinical Sign
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={currentClinicalSign}
                  onChange={(e) => setCurrentClinicalSign(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Add clinical sign"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleArrayAdd(
                      "clinicalSigns",
                      currentClinicalSign,
                      setCurrentClinicalSign
                    )
                  }
                  className={`${buttonClass} bg-orange-500 text-white hover:bg-orange-600`}
                >
                  Add
                </button>
              </div>
              {recordData.clinicalSigns.length > 0 && (
                <div className="mt-4 space-y-2">
                  {recordData.clinicalSigns.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
                    >
                      <span className="text-sm text-gray-800">{item}</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleArrayRemove("clinicalSigns", index)
                        }
                        className="text-red-500 hover:text-red-700 text-lg transition-colors duration-200"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Previous History */}
          <div className={sectionContainerClass}>
            <h3 className={sectionHeaderClass}>Previous History</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Previous History Items
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={currentPreviousHistory}
                  onChange={(e) => setCurrentPreviousHistory(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                  placeholder="Add previous history item"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleArrayAdd(
                      "previousHistory",
                      currentPreviousHistory,
                      setCurrentPreviousHistory
                    )
                  }
                  className={`${buttonClass} bg-orange-500 text-white hover:bg-orange-600`}
                >
                  Add
                </button>
              </div>
              {recordData.previousHistory.length > 0 && (
                <div className="mt-4 space-y-2">
                  {recordData.previousHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
                    >
                      <span className="text-sm text-gray-800">{item}</span>
                      <button
                        type="button"
                        onClick={() =>
                          handleArrayRemove("previousHistory", index)
                        }
                        className="text-red-500 hover:text-red-700 text-lg transition-colors duration-200"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Conclusion */}
          <div className={sectionContainerClass}>
            <h3 className={sectionHeaderClass}>
              Conclusion <span className="text-red-500">*</span>
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conclusion
                </label>
                <textarea
                  name="conclusion"
                  value={recordData.conclusion}
                  onChange={handleChange}
                  rows="3"
                  className={inputClass}
                  required
                  placeholder="Summary of findings and next steps"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prognosis
                </label>
                <input
                  type="text"
                  name="progonosis"
                  value={recordData.progonosis}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Good / Fair / Guarded / Poor"
                />
              </div>
            </div>
          </div>

          {/* Vaccination Status */}
          <div className={sectionContainerClass}>
            <h3 className={sectionHeaderClass}>Vaccination Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rabies"
                  name="rabies"
                  checked={recordData.vaccinationStatus.rabies}
                  onChange={handleVaccinationChange}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="rabies"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Rabies
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="dhppil"
                  name="dhppil"
                  checked={recordData.vaccinationStatus.dhppil}
                  onChange={handleVaccinationChange}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="dhppil"
                  className="ml-2 block text-sm text-gray-700"
                >
                  DHPPiL
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="corona"
                  name="corona"
                  checked={recordData.vaccinationStatus.corona}
                  onChange={handleVaccinationChange}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="corona"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Corona
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="dewormed"
                  name="dewormed"
                  checked={recordData.vaccinationStatus.dewormed}
                  onChange={handleVaccinationChange}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="dewormed"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Dewormed
                </label>
              </div>
            </div>
          </div>

          {/* Medications */}
          <div className={sectionContainerClass}>
            <h3 className={sectionHeaderClass}>Medications</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentMedication.name}
                    onChange={(e) =>
                      setCurrentMedication({
                        ...currentMedication,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    placeholder="Amoxicillin"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={currentMedication.dosage}
                    onChange={(e) =>
                      setCurrentMedication({
                        ...currentMedication,
                        dosage: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    placeholder="10mg/kg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Frequency <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentMedication.frequency}
                    onChange={(e) =>
                      setCurrentMedication({
                        ...currentMedication,
                        frequency: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    placeholder="BID"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentMedication.duration}
                    onChange={(e) =>
                      setCurrentMedication({
                        ...currentMedication,
                        duration: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    placeholder="7 days"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Qty <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentMedication.quantity}
                    onChange={(e) =>
                      setCurrentMedication({
                        ...currentMedication,
                        quantity: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    placeholder="30 tablets"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleMedicationAdd}
                className={`${buttonClass} bg-orange-500 text-white hover:bg-orange-600`}
                disabled={!currentMedication.name.trim()}
              >
                Add Medication
              </button>
            </div>

            {recordData.medications.length > 0 && (
              <div className="mt-4 space-y-3">
                {recordData.medications.map((med, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="flex-grow text-sm text-gray-800">
                      <span className="font-medium">{med.name}</span> -{" "}
                      {med.dosage && <span>Dosage: {med.dosage}, </span>}
                      {med.frequency && <span>Freq: {med.frequency}, </span>}
                      {med.duration && <span>Duration: {med.duration}, </span>}
                      {med.quantity && <span>Qty: {med.quantity}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMedicationRemove(index)}
                      className="text-red-500 hover:text-red-700 ml-2 text-lg transition-colors duration-200"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes and Follow-up */}
          <div className={sectionContainerClass}>
            <h3 className={sectionHeaderClass}>Notes & Follow-up</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Veterinarian Notes
                </label>
                <textarea
                  name="notes"
                  value={recordData.notes}
                  onChange={handleChange}
                  rows="3"
                  className={inputClass}
                  placeholder="Detailed observations during the visit"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Care Advice
                </label>
                <textarea
                  name="advice"
                  value={recordData.advice}
                  onChange={handleChange}
                  rows="3"
                  className={inputClass}
                  placeholder="Instructions for pet owner"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  name="followUpDate"
                  value={recordData.followUpDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="treatmentCompleted"
                  name="treatmentCompleted"
                  checked={recordData.treatmentCompleted}
                  onChange={(e) =>
                    setRecordData({
                      ...recordData,
                      treatmentCompleted: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
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
        </div>

        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className={`${buttonClass} border border-gray-300 text-gray-700 hover:bg-gray-100`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${buttonClass} bg-orange-500 text-white hover:bg-orange-600`}
          >
            Save Medical Record
          </button>
        </div>
      </form>
    </div>
  );
};
