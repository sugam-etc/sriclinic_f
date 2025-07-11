import { useState, useEffect } from "react";
import { FileUploadSection } from "./FileUploadSection";
import { format } from "date-fns";

export const AddMedicalRecord = ({ petId, initialData, onSave, onCancel }) => {
  const [recordData, setRecordData] = useState({
    veterinarian: "",
    weight: "",
    examination: [],
    previousHistory: [],
    pulseRate: "", // Keep only this one (root level)
    treatmentPlan: [],
    clinicalSigns: [],
    conclusion: "",
    diagnosis: [],
    reason: "",
    treatment: [],
    medications: [],
    notes: "",
    followUpDate: "",
    progonosis: "",
    clinicalFinding: [],
    advice: "",
    treatmentCompleted: false,
    vaccinationStatus: {
      rabies: false,
      dhppil: false,
      corona: false,
      dewormed: false,
    },
    clinicalExamination: {
      temperature: "",
      respiration: "",
      // Remove pulse from here
      mucousMembranes: "",
      skin: "",
      capillaryRefillTime: "",
      weight: "",
      bodyConditionScore: "",
      hydrationStatus: "Normal",
      otherFindings: "",
    },
    consentForms: [],
    medicalReportFiles: [],
    surgeryReportFiles: [],
    vaccinationReportFiles: [],
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

  // Populate form with initialData if in edit mode
  useEffect(() => {
    if (initialData) {
      setRecordData({
        ...initialData,
        // Ensure date fields are correctly formatted for input type="date"
        followUpDate: initialData.followUpDate
          ? format(new Date(initialData.followUpDate), "yyyy-MM-dd")
          : "",
        // Files from existing records are handled by FileList in ViewMedicalRecord
        // For AddMedicalRecord, we only care about new files being added.
        // So, we reset the file arrays to empty for the form's file input.
        consentForms: [],
        medicalReportFiles: [],
        surgeryReportFiles: [],
        vaccinationReportFiles: [],
      });
      // Set clinical examination weight separately as it's part of recordData.clinicalExamination
      if (initialData.clinicalExamination?.weight) {
        setRecordData((prev) => ({
          ...prev,
          clinicalExamination: {
            ...prev.clinicalExamination,
            weight: initialData.clinicalExamination.weight,
          },
        }));
      }
    }
  }, [initialData]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // If editing, include the record ID
    if (initialData?._id) {
      formData.append("recordId", initialData._id);
    }

    formData.append("petId", petId);
    formData.append("veterinarian", recordData.veterinarian);
    formData.append("weight", recordData.clinicalExamination.weight); // Use clinicalExamination.weight
    formData.append("pulseRate", recordData.pulseRate);
    formData.append("conclusion", recordData.conclusion);
    formData.append("progonosis", recordData.progonosis);
    formData.append("reason", recordData.reason);
    formData.append("notes", recordData.notes);
    formData.append("advice", recordData.advice);
    formData.append("treatmentCompleted", recordData.treatmentCompleted);

    if (recordData.followUpDate) {
      formData.append("followUpDate", recordData.followUpDate);
    }

    recordData.examination.forEach((item) =>
      formData.append("examination[]", item)
    );
    recordData.previousHistory.forEach((item) =>
      formData.append("previousHistory[]", item)
    );
    recordData.treatmentPlan.forEach((item) =>
      formData.append("treatmentPlan[]", item)
    );
    recordData.clinicalSigns.forEach((item) =>
      formData.append("clinicalSigns[]", item)
    );
    recordData.diagnosis.forEach((item) =>
      formData.append("diagnosis[]", item)
    );
    recordData.treatment.forEach((item) =>
      formData.append("treatment[]", item)
    );
    recordData.clinicalFinding.forEach((item) =>
      formData.append("clinicalFinding[]", item)
    );

    recordData.medications.forEach((med, index) => {
      formData.append(`medications[${index}][name]`, med.name);
      formData.append(`medications[${index}][dosage]`, med.dosage);
      formData.append(`medications[${index}][frequency]`, med.frequency);
      formData.append(`medications[${index}][duration]`, med.duration);
      formData.append(`medications[${index}][quantity]`, med.quantity);
    });

    formData.append(
      "vaccinationStatus[rabies]",
      recordData.vaccinationStatus.rabies
    );
    formData.append(
      "vaccinationStatus[dhppil]",
      recordData.vaccinationStatus.dhppil
    );
    formData.append(
      "vaccinationStatus[corona]",
      recordData.vaccinationStatus.corona
    );
    formData.append(
      "vaccinationStatus[dewormed]",
      recordData.vaccinationStatus.dewormed
    );

    const clinicalExam = recordData.clinicalExamination;
    formData.append(
      "clinicalExamination[temperature]",
      clinicalExam.temperature
    );
    formData.append(
      "clinicalExamination[respiration]",
      clinicalExam.respiration
    );
    formData.append("clinicalExamination[pulse]", clinicalExam.pulse);
    formData.append(
      "clinicalExamination[mucousMembranes]",
      clinicalExam.mucousMembranes
    );
    formData.append("clinicalExamination[skin]", clinicalExam.skin);
    formData.append(
      "clinicalExamination[capillaryRefillTime]",
      clinicalExam.capillaryRefillTime
    );
    formData.append("clinicalExamination[weight]", clinicalExam.weight);
    formData.append(
      "clinicalExamination[bodyConditionScore]",
      clinicalExam.bodyConditionScore
    );
    formData.append(
      "clinicalExamination[hydrationStatus]",
      clinicalExam.hydrationStatus
    );
    formData.append(
      "clinicalExamination[otherFindings]",
      clinicalExam.otherFindings
    );

    const fileTypes = [
      "consentForms",
      "medicalReportFiles",
      "surgeryReportFiles",
      "vaccinationReportFiles",
    ];

    fileTypes.forEach((type) => {
      recordData[type]?.forEach((file) => {
        if (file.file) {
          formData.append(`${type}`, file.file);
        }
      });
    });

    onSave(petId, formData);
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100 max-w-7xl mx-auto my-8">
      <h2 className="text-4xl font-extrabold text-orange-600 mb-8 text-center tracking-tight">
        {initialData ? "Edit Medical Record" : "Add New Medical Record"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Visit Information */}
          <SectionCard title="Visit Information">
            <div>
              <Label htmlFor="veterinarian">Veterinarian *</Label>
              <Input
                type="text"
                id="veterinarian"
                name="veterinarian"
                value={recordData.veterinarian}
                onChange={handleChange}
                required
                placeholder="Dr. Alex Johnson"
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason for Visit</Label>
              <Textarea
                id="reason"
                name="reason"
                value={recordData.reason}
                onChange={handleChange}
                placeholder="Annual checkup, vaccination, injury"
                rows="2"
              />
            </div>
          </SectionCard>

          {/* Clinical Examination */}
          <SectionCard title="Clinical Examination">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  type="number"
                  id="weight"
                  name="weight"
                  value={recordData.clinicalExamination.weight}
                  onChange={handleClinicalExamChange}
                  required
                  step="0.1"
                  min="0"
                  placeholder="e.g., 15.2"
                />
              </div>
              <div>
                <Label htmlFor="pulseRate">Pulse Rate (bpm) *</Label>
                <Input
                  type="text"
                  id="pulseRate"
                  name="pulseRate"
                  value={recordData.pulseRate}
                  onChange={handleChange} // Use handleChange instead of handleClinicalExamChange
                  required
                  placeholder="e.g., 120"
                />
              </div>
              <div>
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input
                  type="text"
                  id="temperature"
                  name="temperature"
                  value={recordData.clinicalExamination.temperature}
                  onChange={handleClinicalExamChange}
                  placeholder="e.g., 38.5"
                />
              </div>
              <div>
                <Label htmlFor="respiration">Respiration (breaths/min)</Label>
                <Input
                  type="text"
                  id="respiration"
                  name="respiration"
                  value={recordData.clinicalExamination.respiration}
                  onChange={handleClinicalExamChange}
                  placeholder="e.g., 25"
                />
              </div>
              <div>
                <Label htmlFor="hydrationStatus">Hydration Status</Label>
                <Select
                  id="hydrationStatus"
                  name="hydrationStatus"
                  value={recordData.clinicalExamination.hydrationStatus}
                  onChange={handleClinicalExamChange}
                >
                  <option value="Normal">Normal</option>
                  <option value="Mildly Dehydrated">Mildly Dehydrated</option>
                  <option value="Moderately Dehydrated">
                    Moderately Dehydrated
                  </option>
                  <option value="Severely Dehydrated">
                    Severely Dehydrated
                  </option>
                </Select>
              </div>
              <div>
                <Label htmlFor="mucousMembranes">Mucous Membranes</Label>
                <Input
                  type="text"
                  id="mucousMembranes"
                  name="mucousMembranes"
                  value={recordData.clinicalExamination.mucousMembranes}
                  onChange={handleClinicalExamChange}
                  placeholder="e.g., Pink, moist"
                />
              </div>
              <div>
                <Label htmlFor="capillaryRefillTime">
                  Capillary Refill Time (sec)
                </Label>
                <Input
                  type="text"
                  id="capillaryRefillTime"
                  name="capillaryRefillTime"
                  value={recordData.clinicalExamination.capillaryRefillTime}
                  onChange={handleClinicalExamChange}
                  placeholder="e.g., <2"
                />
              </div>
              <div>
                <Label htmlFor="bodyConditionScore">
                  Body Condition Score (1-9)
                </Label>
                <Input
                  type="number"
                  id="bodyConditionScore"
                  name="bodyConditionScore"
                  value={recordData.clinicalExamination.bodyConditionScore}
                  onChange={handleClinicalExamChange}
                  min="1"
                  max="9"
                  placeholder="e.g., 5"
                />
              </div>
              <div className="col-span-1 sm:col-span-2">
                <Label htmlFor="otherFindings">Other Findings</Label>
                <Textarea
                  id="otherFindings"
                  name="otherFindings"
                  value={recordData.clinicalExamination.otherFindings}
                  onChange={handleClinicalExamChange}
                  rows="2"
                  placeholder="Any other relevant observations"
                />
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Examination Findings */}
          <SectionCard title="Examination Findings">
            <ArrayInput
              label="Examination Items"
              placeholder="Add examination item (e.g., Dental health, Coat condition)"
              currentValue={currentExamination}
              setCurrentValue={setCurrentExamination}
              onAdd={() =>
                handleArrayAdd(
                  "examination",
                  currentExamination,
                  setCurrentExamination
                )
              }
              items={recordData.examination}
              onRemove={(index) => handleArrayRemove("examination", index)}
            />
          </SectionCard>

          {/* Clinical Signs */}
          <SectionCard title="Clinical Signs">
            <ArrayInput
              label="Clinical Signs"
              placeholder="Add clinical sign (e.g., Vomiting, Lethargy)"
              currentValue={currentClinicalSign}
              setCurrentValue={setCurrentClinicalSign}
              onAdd={() =>
                handleArrayAdd(
                  "clinicalSigns",
                  currentClinicalSign,
                  setCurrentClinicalSign
                )
              }
              items={recordData.clinicalSigns}
              onRemove={(index) => handleArrayRemove("clinicalSigns", index)}
            />
          </SectionCard>

          {/* Clinical Finding */}
          <SectionCard title="Clinical Finding">
            <ArrayInput
              label="Clinical Finding"
              placeholder="Add clinical finding (e.g., Abdominal pain, Lymph node enlargement)"
              currentValue={currentClinicalFinding}
              setCurrentValue={setCurrentClinicalFinding}
              onAdd={() =>
                handleArrayAdd(
                  "clinicalFinding",
                  currentClinicalFinding,
                  setCurrentClinicalFinding
                )
              }
              items={recordData.clinicalFinding}
              onRemove={(index) => handleArrayRemove("clinicalFinding", index)}
            />
          </SectionCard>

          {/* Previous History */}
          <SectionCard title="Previous History">
            <ArrayInput
              label="Previous History Items"
              placeholder="Add previous history (e.g., Previous surgeries, Chronic conditions)"
              currentValue={currentPreviousHistory}
              setCurrentValue={setCurrentPreviousHistory}
              onAdd={() =>
                handleArrayAdd(
                  "previousHistory",
                  currentPreviousHistory,
                  setCurrentPreviousHistory
                )
              }
              items={recordData.previousHistory}
              onRemove={(index) => handleArrayRemove("previousHistory", index)}
            />
          </SectionCard>

          {/* Diagnosis */}
          <SectionCard title="Diagnosis">
            <ArrayInput
              label="Diagnosis Items *"
              placeholder="Add diagnosis (e.g., Gastroenteritis, Otitis externa)"
              currentValue={currentDiagnosis}
              setCurrentValue={setCurrentDiagnosis}
              onAdd={() =>
                handleArrayAdd(
                  "diagnosis",
                  currentDiagnosis,
                  setCurrentDiagnosis
                )
              }
              items={recordData.diagnosis}
              onRemove={(index) => handleArrayRemove("diagnosis", index)}
            />
          </SectionCard>

          {/* Treatment */}
          <SectionCard title="Treatment">
            <ArrayInput
              label="Treatment Items"
              placeholder="Add treatment (e.g., Antibiotics, Fluid therapy)"
              currentValue={currentTreatment}
              setCurrentValue={setCurrentTreatment}
              onAdd={() =>
                handleArrayAdd(
                  "treatment",
                  currentTreatment,
                  setCurrentTreatment
                )
              }
              items={recordData.treatment}
              onRemove={(index) => handleArrayRemove("treatment", index)}
            />
          </SectionCard>

          {/* Treatment Plan */}
          <SectionCard title="Treatment Plan">
            <ArrayInput
              label="Treatment Plan Items *"
              placeholder="Add treatment plan (e.g., Daily medication, Recheck in 2 weeks)"
              currentValue={currentTreatmentPlan}
              setCurrentValue={setCurrentTreatmentPlan}
              onAdd={() =>
                handleArrayAdd(
                  "treatmentPlan",
                  currentTreatmentPlan,
                  setCurrentTreatmentPlan
                )
              }
              items={recordData.treatmentPlan}
              onRemove={(index) => handleArrayRemove("treatmentPlan", index)}
            />
          </SectionCard>

          {/* Medications */}
          <SectionCard title="Medications">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div>
                  <Label htmlFor="medicationName">Name *</Label>
                  <Input
                    type="text"
                    id="medicationName"
                    value={currentMedication.name}
                    onChange={(e) =>
                      setCurrentMedication({
                        ...currentMedication,
                        name: e.target.value,
                      })
                    }
                    placeholder="Amoxicillin"
                  />
                </div>
                <div>
                  <Label htmlFor="medicationDosage">Dosage</Label>
                  <Input
                    type="text"
                    id="medicationDosage"
                    value={currentMedication.dosage}
                    onChange={(e) =>
                      setCurrentMedication({
                        ...currentMedication,
                        dosage: e.target.value,
                      })
                    }
                    placeholder="10mg/kg"
                  />
                </div>
                <div>
                  <Label htmlFor="medicationFrequency">Frequency *</Label>
                  <Input
                    type="text"
                    id="medicationFrequency"
                    value={currentMedication.frequency}
                    onChange={(e) =>
                      setCurrentMedication({
                        ...currentMedication,
                        frequency: e.target.value,
                      })
                    }
                    placeholder="BID"
                  />
                </div>
                <div>
                  <Label htmlFor="medicationDuration">Duration *</Label>
                  <Input
                    type="text"
                    id="medicationDuration"
                    value={currentMedication.duration}
                    onChange={(e) =>
                      setCurrentMedication({
                        ...currentMedication,
                        duration: e.target.value,
                      })
                    }
                    placeholder="7 days"
                  />
                </div>
                <div>
                  <Label htmlFor="medicationQuantity">Qty *</Label>
                  <Input
                    type="text"
                    id="medicationQuantity"
                    value={currentMedication.quantity}
                    onChange={(e) =>
                      setCurrentMedication({
                        ...currentMedication,
                        quantity: e.target.value,
                      })
                    }
                    placeholder="30 tablets"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleMedicationAdd}
                className="w-full sm:w-auto px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all duration-300 shadow-md text-sm font-semibold"
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
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white px-4 py-3 rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="flex-grow text-sm text-gray-800">
                      <span className="font-semibold">{med.name}</span> -{" "}
                      {med.dosage && <span>Dosage: {med.dosage}, </span>}
                      {med.frequency && <span>Freq: {med.frequency}, </span>}
                      {med.duration && <span>Duration: {med.duration}, </span>}
                      {med.quantity && <span>Qty: {med.quantity}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleMedicationRemove(index)}
                      className="text-red-500 hover:text-red-700 ml-0 sm:ml-2 mt-2 sm:mt-0 text-lg"
                      aria-label="Remove medication"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Vaccination Status */}
          <SectionCard title="Vaccination Status">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Checkbox
                id="rabies"
                name="rabies"
                checked={recordData.vaccinationStatus.rabies}
                onChange={handleVaccinationChange}
                label="Rabies"
              />
              <Checkbox
                id="dhppil"
                name="dhppil"
                checked={recordData.vaccinationStatus.dhppil}
                onChange={handleVaccinationChange}
                label="DHPPiL"
              />
              <Checkbox
                id="corona"
                name="corona"
                checked={recordData.vaccinationStatus.corona}
                onChange={handleVaccinationChange}
                label="Corona"
              />
              <Checkbox
                id="dewormed"
                name="dewormed"
                checked={recordData.vaccinationStatus.dewormed}
                onChange={handleVaccinationChange}
                label="Dewormed"
              />
            </div>
          </SectionCard>

          {/* Conclusion */}
          <SectionCard title="Conclusion & Prognosis">
            <div>
              <Label htmlFor="conclusion">Conclusion *</Label>
              <Textarea
                id="conclusion"
                name="conclusion"
                value={recordData.conclusion}
                onChange={handleChange}
                rows="3"
                required
                placeholder="Summary of findings and next steps"
              />
            </div>
            <div>
              <Label htmlFor="progonosis">Prognosis</Label>
              <Input
                type="text"
                id="progonosis"
                name="progonosis"
                value={recordData.progonosis}
                onChange={handleChange}
                placeholder="Good, Fair, Guarded, Poor"
              />
            </div>
          </SectionCard>
        </div>

        {/* Notes and Follow-up */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <SectionCard title="Notes & Follow-up">
            <div>
              <Label htmlFor="notes">Veterinarian Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                value={recordData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Detailed observations during the visit"
              />
            </div>
            <div>
              <Label htmlFor="advice">Care Advice</Label>
              <Textarea
                id="advice"
                name="advice"
                value={recordData.advice}
                onChange={handleChange}
                rows="3"
                placeholder="Instructions for pet owner (e.g., diet changes, exercise routine)"
              />
            </div>
            <div>
              <Label htmlFor="followUpDate">Follow-up Date</Label>
              <Input
                type="date"
                id="followUpDate"
                name="followUpDate"
                value={recordData.followUpDate}
                onChange={handleChange}
              />
            </div>
            <Checkbox
              id="treatmentCompleted"
              name="treatmentCompleted"
              checked={recordData.treatmentCompleted}
              onChange={(e) =>
                setRecordData({
                  ...recordData,
                  treatmentCompleted: e.target.checked,
                })
              }
              label="Treatment Completed"
            />
          </SectionCard>

          {/* File Attachments */}
          <FileUploadSection
            recordData={recordData}
            setRecordData={setRecordData}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
          <Button type="button" onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {initialData ? "Update Medical Record" : "Save Medical Record"}
          </Button>
        </div>
      </form>
    </div>
  );
};

// Reusable UI Components for consistency and cleaner JSX
const SectionCard = ({ title, children }) => (
  <div className="space-y-6 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
    <h3 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-4">
      {title}
    </h3>
    <div className="space-y-4">{children}</div>
  </div>
);

const Label = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-medium text-gray-700 mb-1"
  >
    {children}
  </label>
);

const Input = ({
  type = "text",
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  step,
  min,
  max,
}) => (
  <input
    type={type}
    id={id}
    name={name}
    value={value}
    onChange={onChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900"
    required={required}
    placeholder={placeholder}
    step={step}
    min={min}
    max={max}
  />
);

const Textarea = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
}) => (
  <textarea
    id={id}
    name={name}
    value={value}
    onChange={onChange}
    rows={rows}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900"
    required={required}
    placeholder={placeholder}
  />
);

const Select = ({ id, name, value, onChange, children }) => (
  <select
    id={id}
    name={name}
    value={value}
    onChange={onChange}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 bg-white"
  >
    {children}
  </select>
);

const Checkbox = ({ id, name, checked, onChange, label }) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      id={id}
      name={name}
      checked={checked}
      onChange={onChange}
      className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded-md cursor-pointer"
    />
    <label htmlFor={id} className="ml-3 block text-base text-gray-800">
      {label}
    </label>
  </div>
);

const ArrayInput = ({
  label,
  placeholder,
  currentValue,
  setCurrentValue,
  onAdd,
  items,
  onRemove,
}) => (
  <div>
    <Label>{label}</Label>
    <div className="flex flex-col sm:flex-row gap-3 mb-3">
      <Input
        type="text"
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        placeholder={placeholder}
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onAdd();
          }
        }}
      />
      <Button type="button" onClick={onAdd} variant="tertiary">
        Add
      </Button>
    </div>
    {items.length > 0 && (
      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 shadow-sm"
          >
            <span className="text-sm text-gray-800">{item}</span>
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="text-red-500 hover:text-red-700 text-lg ml-2"
              aria-label="Remove item"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

const Button = ({ type, onClick, variant, children }) => {
  const baseStyle =
    "px-8 py-3 rounded-xl font-semibold transition-all duration-300 shadow-md";
  let variantStyle = "";

  switch (variant) {
    case "primary":
      variantStyle =
        "bg-orange-600 text-white hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2";
      break;
    case "secondary":
      variantStyle =
        "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2";
      break;
    case "tertiary":
      variantStyle = "bg-orange-500 text-white hover:bg-orange-600 text-sm";
      break;
    case "danger":
      variantStyle = "bg-red-500 text-white hover:bg-red-600 text-sm";
      break;
    default:
      variantStyle = "bg-gray-800 text-white hover:bg-gray-900";
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyle} ${variantStyle}`}
    >
      {children}
    </button>
  );
};
