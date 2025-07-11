// src/components/medicalRecords/MedicalRecordItem.jsx
import { formatDate } from "./BasicPetInfo"; // Assuming formatDate is correctly imported from BasicPetInfo or a utility file

export const MedicalRecordItem = ({ record, onDownload, onDeleteFile }) => {
  const renderFiles = (files, fileType) => {
    if (!files || files.length === 0) return null;

    return (
      <div className="mt-4 space-y-3">
        <h4 className="text-base font-semibold text-gray-800 mb-2">
          Attachments ({fileType.replace(/([A-Z])/g, " $1").trim()}):
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {files.map((file, index) => (
            <div
              key={file._id || index}
              className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-center w-full h-20 mb-2">
                {file.fileType?.startsWith("image/") ? (
                  <img
                    src={`/api/medical-records/${record._id}/files/${fileType}/${file._id}/download`}
                    alt={file.fileName}
                    className="max-w-full max-h-full object-contain rounded-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/100x100/E5E7EB/4B5563?text=IMG";
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 bg-orange-100 text-orange-700 flex items-center justify-center rounded-md font-bold text-sm">
                    DOC
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-700 font-medium truncate w-full mb-1">
                {file.fileName}
              </span>
              <a
                href={`/api/medical-records/${record._id}/files/${fileType}/${file._id}/download`}
                download
                className="text-xs text-orange-600 hover:text-orange-700 hover:underline font-semibold transition-colors duration-200"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const SectionTitle = ({ children }) => (
    <h4 className="text-base font-semibold text-gray-800 border-b border-gray-200 pb-1 mb-2">
      {children}
    </h4>
  );

  const ListItem = ({ label, value }) => (
    <div className="flex justify-between items-start text-sm text-gray-700">
      <span className="font-medium mr-2">{label}:</span>
      <p className="text-right flex-1">{value}</p>
    </div>
  );

  const BulletList = ({ title, items }) => {
    if (!items || items.length === 0) return null;
    return (
      <div>
        <SectionTitle>{title}:</SectionTitle>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6 border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2 sm:mb-0">
          Medical Record - {formatDate(record.date, "MMMM d, yyyy")}
        </h3>
        <span className="text-sm text-gray-600 font-medium">
          Dr. {record.veterinarian}
        </span>
      </div>

      {record.reason && (
        <div>
          <SectionTitle>Reason for Visit:</SectionTitle>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {record.reason}
          </p>
        </div>
      )}

      {/* Clinical Examination Summary */}
      {(record.clinicalExamination || record.examination?.length > 0) && (
        <div className="space-y-3">
          <SectionTitle>Clinical Examination:</SectionTitle>
          {record.clinicalExamination && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
              {record.clinicalExamination.temperature && (
                <ListItem
                  label="Temperature"
                  value={`${record.clinicalExamination.temperature} °C`}
                />
              )}
              {record.clinicalExamination.pulse && (
                <ListItem
                  label="Pulse"
                  value={`${record.clinicalExamination.pulse} bpm`}
                />
              )}
              {record.clinicalExamination.respiration && (
                <ListItem
                  label="Respiration"
                  value={`${record.clinicalExamination.respiration} breaths/min`}
                />
              )}
              {record.clinicalExamination.weight && (
                <ListItem
                  label="Weight"
                  value={`${record.clinicalExamination.weight} kg`}
                />
              )}
              {record.clinicalExamination.bodyConditionScore && (
                <ListItem
                  label="BCS"
                  value={`${record.clinicalExamination.bodyConditionScore}/9`}
                />
              )}
              {record.clinicalExamination.hydrationStatus && (
                <ListItem
                  label="Hydration"
                  value={record.clinicalExamination.hydrationStatus}
                />
              )}
              {record.clinicalExamination.capillaryRefillTime && (
                <ListItem
                  label="CRT"
                  value={`${record.clinicalExamination.capillaryRefillTime} sec`}
                />
              )}
              {record.clinicalExamination.mucousMembranes && (
                <ListItem
                  label="Mucous Membranes"
                  value={record.clinicalExamination.mucousMembranes}
                />
              )}
              {record.clinicalExamination.skin && (
                <ListItem
                  label="Skin"
                  value={record.clinicalExamination.skin}
                />
              )}
              {record.clinicalExamination.otherFindings && (
                <ListItem
                  label="Other Findings"
                  value={record.clinicalExamination.otherFindings}
                />
              )}
            </div>
          )}
          {record.examination?.length > 0 && (
            <BulletList
              title="Detailed Examination"
              items={record.examination}
            />
          )}
        </div>
      )}

      <BulletList title="Clinical Signs" items={record.clinicalSigns} />
      <BulletList title="Clinical Findings" items={record.clinicalFinding} />
      <BulletList title="Previous History" items={record.previousHistory} />
      <BulletList title="Diagnosis" items={record.diagnosis} />
      <BulletList title="Treatment" items={record.treatment} />
      <BulletList title="Treatment Plan" items={record.treatmentPlan} />

      {record.medications?.length > 0 && (
        <div>
          <SectionTitle>Medications Prescribed:</SectionTitle>
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Medication
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Dosage
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Frequency
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Quantity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {record.medications.map((med, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {med.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {med.dosage}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {med.frequency}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {med.duration}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {med.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {record.vaccinationStatus && (
        <div>
          <SectionTitle>Vaccination Status:</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-gray-700">
            {Object.entries(record.vaccinationStatus).map(
              ([vaccine, status]) => (
                <div key={vaccine} className="flex items-center">
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${
                      status ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  <span className="capitalize">{vaccine}</span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {record.notes && (
        <div>
          <SectionTitle>Veterinarian Notes:</SectionTitle>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {record.notes}
          </p>
        </div>
      )}

      {record.conclusion && (
        <div>
          <SectionTitle>Conclusion:</SectionTitle>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {record.conclusion}
          </p>
        </div>
      )}

      {record.progonosis && (
        <div>
          <SectionTitle>Prognosis:</SectionTitle>
          <p className="text-sm text-gray-700">{record.progonosis}</p>
        </div>
      )}

      {record.advice && (
        <div>
          <SectionTitle>Care Advice:</SectionTitle>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {record.advice}
          </p>
        </div>
      )}

      {record.followUpDate && (
        <div>
          <SectionTitle>Follow-up:</SectionTitle>
          <p className="text-sm text-gray-700">
            Scheduled for:{" "}
            <span className="font-medium text-orange-600">
              {formatDate(record.followUpDate, "MMMM dd, yyyy")}
            </span>
          </p>
        </div>
      )}

      {/* Render files for each type */}
      {renderFiles(record.consentForms, "consentForms")}
      {renderFiles(record.medicalReportFiles, "medicalReportFiles")}
      {renderFiles(record.surgeryReportFiles, "surgeryReportFiles")}
      {renderFiles(record.vaccinationReportFiles, "vaccinationReportFiles")}
    </div>
  );
};
