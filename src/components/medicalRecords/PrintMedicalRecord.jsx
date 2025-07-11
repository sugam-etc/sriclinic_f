import React, { useEffect } from "react";
import { format } from "date-fns";
// Import the new CSS file for print specific styles
import "./style.medicalrecord.css";

export const PrintMedicalRecord = ({ record, patient, owner, onBack }) => {
  console.log("PRINT", owner);
  useEffect(() => {
    // Add a class to the body when printing view is active
    // This can be used for more specific styling if needed, alongside index.css
    document.body.classList.add("print-view-active");
    return () => {
      // Remove the class when component unmounts
      document.body.classList.remove("print-view-active");
    };
  }, []);

  const handlePrint = () => {
    // The CSS in index.css and style.medicalrecord.css now handles visibility and styling
    window.print();
  };

  const SectionTitle = ({ children }) => (
    <h2 className="section-title">{children}</h2>
  );

  const DetailItem = ({ label, value }) => {
    if (!value) return null;
    return (
      <div className="detail-item">
        <p className="label">{label}:</p>
        <p className="value">{value}</p>
      </div>
    );
  };

  const ListItem = ({ children }) => <li>{children}</li>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* The main container for the printable content, now using .printable-record class */}
      <div className="printable-record">
        {/* Header */}
        <div className="print-header">
          <h1>Veterinary Clinic</h1>
          <p>Medical Record</p>
          <p className="date">Date: {format(new Date(), "MMMM dd, yyyy")}</p>
        </div>

        {/* Patient Information */}
        <SectionTitle>Patient Information</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <DetailItem label="Name" value={patient?.name} />
          <DetailItem label="Species" value={patient?.species} />
          <DetailItem label="Breed" value={patient?.breed} />
          <DetailItem label="Age" value={patient?.age} />
          <DetailItem label="Sex" value={patient?.gender} />
          <DetailItem label="Weight" value={`${record.weight} kg`} />
        </div>

        {/* Client (Owner) Information */}
        <SectionTitle>Client (Owner) Information</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <DetailItem label="Owner Name" value={owner?.owner || "N/A"} />
          <DetailItem label="Phone" value={owner?.contact || "N/A"} />
          <DetailItem label="Email" value={owner?.email || "N/A"} />
          <DetailItem label="Address" value={owner?.address || "N/A"} />
        </div>

        {/* Visit Information */}
        <SectionTitle>Visit Information</SectionTitle>
        <div className="mb-6">
          <DetailItem
            label="Veterinarian"
            value={`Dr. ${record.veterinarian}`}
          />
          <DetailItem
            label="Date of Visit"
            value={
              record.date
                ? format(new Date(record.date), "MMMM dd, yyyy - hh:mm a")
                : "N/A"
            }
          />
          {record.reason && (
            <DetailItem label="Reason for Visit" value={record.reason} />
          )}
        </div>

        {/* Clinical Examination */}
        {(record.clinicalExamination || record.examination?.length > 0) && (
          <>
            <SectionTitle>Clinical Examination</SectionTitle>
            {record.clinicalExamination && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <DetailItem
                  label="Temperature"
                  value={
                    record.clinicalExamination.temperature
                      ? `${record.clinicalExamination.temperature} °C`
                      : null
                  }
                />
                <DetailItem
                  label="Pulse"
                  value={
                    record.clinicalExamination.pulse
                      ? `${record.clinicalExamination.pulse} bpm`
                      : null
                  }
                />
                <DetailItem
                  label="Respiration"
                  value={
                    record.clinicalExamination.respiration
                      ? `${record.clinicalExamination.respiration} breaths/min`
                      : null
                  }
                />
                <DetailItem
                  label="Body Condition Score"
                  value={
                    record.clinicalExamination.bodyConditionScore
                      ? `${record.clinicalExamination.bodyConditionScore}/9`
                      : null
                  }
                />
                <DetailItem
                  label="Hydration Status"
                  value={record.clinicalExamination.hydrationStatus}
                />
                <DetailItem
                  label="CRT"
                  value={
                    record.clinicalExamination.capillaryRefillTime
                      ? `${record.clinicalExamination.capillaryRefillTime} sec`
                      : null
                  }
                />
                <DetailItem
                  label="Mucous Membranes"
                  value={record.clinicalExamination.mucousMembranes}
                />
                <DetailItem
                  label="Skin"
                  value={record.clinicalExamination.skin}
                />
                <DetailItem
                  label="Other Findings"
                  value={record.clinicalExamination.otherFindings}
                />
              </div>
            )}
            {record.examination?.length > 0 && (
              <div className="list-section">
                <p className="label">Detailed Examination Findings:</p>
                <ul>
                  {record.examination.map((item, index) => (
                    <ListItem key={index}>{item}</ListItem>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {record.clinicalSigns?.length > 0 && (
          <>
            <SectionTitle>Clinical Signs</SectionTitle>
            <div className="list-section">
              <ul>
                {record.clinicalSigns.map((sign, index) => (
                  <ListItem key={index}>{sign}</ListItem>
                ))}
              </ul>
            </div>
          </>
        )}

        {record.diagnosis?.length > 0 && (
          <>
            <SectionTitle>Diagnosis</SectionTitle>
            <div className="list-section">
              <ul>
                {record.diagnosis.map((item, index) => (
                  <ListItem key={index}>{item}</ListItem>
                ))}
              </ul>
            </div>
          </>
        )}

        {record.treatmentPlan?.length > 0 && (
          <>
            <SectionTitle>Treatment Plan</SectionTitle>
            <div className="list-section">
              <ul>
                {record.treatmentPlan.map((item, index) => (
                  <ListItem key={index}>{item}</ListItem>
                ))}
              </ul>
            </div>
          </>
        )}

        {record.medications?.length > 0 && (
          <>
            <SectionTitle>Medications Prescribed</SectionTitle>
            <div className="overflow-x-auto">
              <table className="medication-table">
                <thead>
                  <tr>
                    <th>Medication</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {record.medications.map((med, index) => (
                    <tr key={index}>
                      <td>{med.name}</td>
                      <td>{med.dosage}</td>
                      <td>{med.frequency}</td>
                      <td>{med.duration}</td>
                      <td>{med.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {record.vaccinationStatus && (
          <>
            <SectionTitle>Vaccination Status</SectionTitle>
            <div className="vaccination-status">
              {Object.entries(record.vaccinationStatus).map(
                ([vaccine, status]) => (
                  <div key={vaccine} className="vaccine-item">
                    <span
                      className={`vaccine-status-indicator ${
                        status ? "green" : "red"
                      }`}
                    ></span>
                    <span className="capitalize">{vaccine}</span>
                  </div>
                )
              )}
            </div>
          </>
        )}

        {record.notes && (
          <DetailItem label="Veterinarian Notes" value={record.notes} />
        )}
        {record.conclusion && (
          <DetailItem label="Conclusion" value={record.conclusion} />
        )}
        {record.progonosis && (
          <DetailItem label="Prognosis" value={record.progonosis} />
        )}
        {record.advice && (
          <DetailItem label="Care Advice" value={record.advice} />
        )}
        {record.followUpDate && (
          <DetailItem
            label="Follow-up Date"
            value={format(new Date(record.followUpDate), "MMMM dd, yyyy")}
          />
        )}

        <div className="print-footer">
          <p>
            Record created:{" "}
            {record.createdAt
              ? format(new Date(record.createdAt), "MMMM dd, yyyy - hh:mm a")
              : "N/A"}
          </p>
          {record.updatedAt && (
            <p>
              Last updated:{" "}
              {format(new Date(record.updatedAt), "MMMM dd, yyyy - hh:mm a")}
            </p>
          )}
        </div>
      </div>

      {/* Buttons for navigation and printing (hidden in print by index.css .no-print) */}
      <div className="no-print fixed bottom-4 right-4 flex space-x-4 z-50">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl font-semibold text-base bg-gray-600 text-white hover:bg-gray-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
          Back to Record
        </button>
        <button
          onClick={handlePrint}
          className="px-6 py-3 rounded-xl font-semibold text-base bg-orange-600 text-white hover:bg-orange-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
          Print
        </button>
      </div>
    </div>
  );
};
