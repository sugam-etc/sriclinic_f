import { formatDate } from "./BasicPetInfo";
import { DetailRow } from "./DetailRow";
import { MedicationsTable } from "./MedicationsTable";
import { formatArray } from "../utils/formatUtils"; // Assuming formatArray is in utils

export const MedicalRecordEntry = ({ record, index }) => (
  <div
    key={record._id || index}
    className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-6 border border-gray-100"
  >
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-gray-200">
      <div className="flex items-center mb-3 sm:mb-0">
        <div className="bg-orange-100 text-orange-800 rounded-full w-10 h-10 flex items-center justify-center mr-4 shadow-inner">
          <span className="font-semibold text-lg">{index + 1}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Visit Details</h3>
      </div>
      <div className="flex items-center text-gray-600">
        <svg
          className="w-5 h-5 text-gray-400 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-base font-medium">{formatDate(record.date)}</span>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 mb-8">
      <div>
        <DetailRow label="Veterinarian" value={record.veterinarian} />
        <DetailRow label="Reason for Visit" value={record.reason} />
        <DetailRow
          label="Weight"
          value={record.weight ? `${record.weight} kg` : "N/A"}
        />
        <DetailRow
          label="Examination Findings"
          value={formatArray(record.examination)}
        />
        <DetailRow
          label="Clinical Signs"
          value={formatArray(record.clinicalSigns)}
        />
        <DetailRow label="Diagnosis" value={formatArray(record.diagnosis)} />
      </div>
      <div>
        <DetailRow label="Treatment" value={formatArray(record.treatment)} />
        <DetailRow
          label="Follow-up Date"
          value={formatDate(record.followUpDate)}
          className={record.followUpDate ? "text-orange-600 font-medium" : ""}
        />
        <DetailRow label="Prognosis" value={record.progonosis || "N/A"} />
        <DetailRow
          label="Treatment Completed"
          value={record.treatmentCompleted ? "Yes" : "No"}
        />
        <DetailRow label="Conclusion" value={record.conclusion || "N/A"} />
      </div>
    </div>

    {/* Clinical Examination Section */}
    {record.clinicalExamination && (
      <div className="mb-8 pt-6 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Clinical Examination
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">
          <DetailRow
            label="Temperature"
            value={
              record.clinicalExamination.temperature
                ? `${record.clinicalExamination.temperature} °C`
                : "N/A"
            }
          />
          <DetailRow
            label="Respiration Rate"
            value={
              record.clinicalExamination.respiration
                ? `${record.clinicalExamination.respiration} /min`
                : "N/A"
            }
          />
          <DetailRow label="Pulse Rate" value={record.pulseRate || "N/A"} />
          <DetailRow
            label="Mucous Membranes"
            value={record.clinicalExamination.mucousMembranes || "N/A"}
          />
          <DetailRow
            label="Skin Condition"
            value={record.clinicalExamination.skin || "N/A"}
          />
          <DetailRow
            label="Capillary Refill"
            value={
              record.clinicalExamination.capillaryRefillTime
                ? `${record.clinicalExamination.capillaryRefillTime} sec`
                : "N/A"
            }
          />
          <DetailRow
            label="Body Condition Score"
            value={record.clinicalExamination.bodyConditionScore || "N/A"}
          />
          <DetailRow
            label="Hydration Status"
            value={record.clinicalExamination.hydrationStatus || "N/A"}
          />
          <DetailRow
            label="Other Findings"
            value={record.clinicalExamination.otherFindings || "N/A"}
            className="md:col-span-2"
          />
        </div>
      </div>
    )}

    {/* Vaccination Status Section */}
    {record.vaccinationStatus && (
      <div className="mb-8 pt-6 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Vaccination Status
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2">
          <DetailRow
            label="Rabies"
            value={
              record.vaccinationStatus.rabies
                ? "✔️ Vaccinated"
                : "❌ Not vaccinated"
            }
          />
          <DetailRow
            label="DHPPiL"
            value={
              record.vaccinationStatus.dhppil
                ? "✔️ Vaccinated"
                : "❌ Not vaccinated"
            }
          />
          <DetailRow
            label="Corona"
            value={
              record.vaccinationStatus.corona
                ? "✔️ Vaccinated"
                : "❌ Not vaccinated"
            }
          />
          <DetailRow
            label="Dewormed"
            value={record.vaccinationStatus.dewormed ? "✔️ Yes" : "❌ No"}
          />
        </div>
      </div>
    )}

    {/* Notes and Advice Sections */}
    <div className="space-y-4 mb-8 pt-6 border-t border-gray-200">
      {record.notes && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
          <h4 className="text-base font-semibold text-gray-800 mb-2">
            Veterinarian Notes
          </h4>
          <p className="text-gray-700 text-sm">{record.notes}</p>
        </div>
      )}

      {record.advice && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 shadow-sm">
          <h4 className="text-base font-semibold text-gray-800 mb-2">
            Care Advice
          </h4>
          <p className="text-gray-700 text-sm">{record.advice}</p>
        </div>
      )}
    </div>

    {/* Medications Section */}
    <MedicationsTable medications={record.medications} />
  </div>
);
