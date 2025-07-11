// MedicalRecordPrintout.jsx
import React from "react";
import { format } from "date-fns";
import { MedicationsTable } from "./MedicationsTable";
import { formatArray } from "../../utils/formatUtils"; // Assuming formatArray is in utils

const MedicalRecordPrintout = ({ petData, recordData }, ref) => {
  return (
    <div
      ref={ref}
      className="bg-white p-8 max-w-4xl mx-auto font-sans text-gray-900 print:p-0 print:text-[12px]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* Header with clinic info */}
      <div className="flex justify-between items-center border-b-2 border-gray-300 pb-4 mb-8 print:border-gray-400">
        <div>
          <h1 className="text-3xl font-bold text-orange-700">
            Veterinary Clinic
          </h1>
          <p className="text-gray-700 mt-1">123 Animal Care Drive, Pet City</p>
          <p className="text-gray-700">Phone: (555) 123-4567</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">
            {format(new Date(), "MMMM dd, yyyy")}
          </p>
          <p className="text-sm text-gray-600">
            Record ID: {recordData._id?.slice(-8).toUpperCase() || "N/A"}
          </p>
        </div>
      </div>

      {/* Patient Information */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
          Patient Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div>
            <p className="mb-1">
              <span className="font-semibold">Name:</span> {petData.name}
            </p>
            <p className="mb-1">
              <span className="font-semibold">Species:</span> {petData.species}
            </p>
            <p className="mb-1">
              <span className="font-semibold">Breed:</span>{" "}
              {petData.breed || "N/A"}
            </p>
          </div>
          <div>
            <p className="mb-1">
              <span className="font-semibold">Age:</span> {petData.age}
            </p>
            <p className="mb-1">
              <span className="font-semibold">Sex:</span> {petData.sex}
            </p>
            <p className="mb-1">
              <span className="font-semibold">Weight:</span> {recordData.weight}{" "}
              kg
            </p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="mb-1">
            <span className="font-semibold">Owner:</span> {petData.ownerName}
          </p>
          <p className="mb-1">
            <span className="font-semibold">Contact:</span>{" "}
            {petData.ownerContact}
          </p>
        </div>
      </div>

      {/* Visit Information */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
          Visit Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          <div>
            <p className="mb-1">
              <span className="font-semibold">Date:</span>{" "}
              {format(new Date(recordData.date), "MMMM dd, yyyy")}
            </p>
            <p className="mb-1">
              <span className="font-semibold">Veterinarian:</span>{" "}
              {recordData.veterinarian}
            </p>
          </div>
          <div>
            <p className="mb-1">
              <span className="font-semibold">Reason for Visit:</span>{" "}
              {recordData.reason || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Examination */}
      {recordData.clinicalExamination && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
            Clinical Examination
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <p className="mb-1">
                <span className="font-semibold">Temperature:</span>{" "}
                {recordData.clinicalExamination.temperature || "N/A"} °C
              </p>
              <p className="mb-1">
                <span className="font-semibold">Pulse Rate:</span>{" "}
                {recordData.pulseRate || "N/A"} bpm
              </p>
              <p className="mb-1">
                <span className="font-semibold">Respiration:</span>{" "}
                {recordData.clinicalExamination.respiration || "N/A"} rpm
              </p>
            </div>
            <div>
              <p className="mb-1">
                <span className="font-semibold">Weight:</span>{" "}
                {recordData.clinicalExamination.weight || "N/A"} kg
              </p>
              <p className="mb-1">
                <span className="font-semibold">Hydration Status:</span>{" "}
                {recordData.clinicalExamination.hydrationStatus || "N/A"}
              </p>
              <p className="mb-1">
                <span className="font-semibold">Body Condition Score:</span>{" "}
                {recordData.clinicalExamination.bodyConditionScore || "N/A"}
              </p>
            </div>
          </div>
          {recordData.clinicalExamination.otherFindings && (
            <div className="mt-4">
              <p className="font-semibold mb-1">Other Findings:</p>
              <p className="border border-gray-200 p-3 rounded bg-gray-50">
                {recordData.clinicalExamination.otherFindings}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Diagnosis */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
          Diagnosis
        </h2>
        <div className="border border-gray-200 p-4 rounded bg-gray-50">
          {recordData.diagnosis?.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {recordData.diagnosis.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">N/A</p>
          )}
        </div>
      </div>

      {/* Treatment */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
          Treatment
        </h2>
        <div className="border border-gray-200 p-4 rounded bg-gray-50">
          {recordData.treatment?.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {recordData.treatment.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">N/A</p>
          )}
        </div>
      </div>

      {/* Medications */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
          Medications
        </h2>
        <MedicationsTable medications={recordData.medications} />
      </div>

      {/* Vaccination Status */}
      {recordData.vaccinationStatus && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
            Vaccination Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            <div>
              <p className="mb-1">
                <span className="font-semibold">Rabies:</span>{" "}
                {recordData.vaccinationStatus.rabies ? "✔️ Yes" : "❌ No"}
              </p>
              <p className="mb-1">
                <span className="font-semibold">DHPPiL:</span>{" "}
                {recordData.vaccinationStatus.dhppil ? "✔️ Yes" : "❌ No"}
              </p>
            </div>
            <div>
              <p className="mb-1">
                <span className="font-semibold">Corona:</span>{" "}
                {recordData.vaccinationStatus.corona ? "✔️ Yes" : "❌ No"}
              </p>
              <p className="mb-1">
                <span className="font-semibold">Dewormed:</span>{" "}
                {recordData.vaccinationStatus.dewormed ? "✔️ Yes" : "❌ No"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Notes and Follow-up */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">
          Additional Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <p className="font-semibold mb-1">Notes:</p>
            <p className="border border-gray-200 p-3 rounded bg-gray-50 min-h-20">
              {recordData.notes || "N/A"}
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">Care Advice:</p>
            <p className="border border-gray-200 p-3 rounded bg-gray-50 min-h-20">
              {recordData.advice || "N/A"}
            </p>
          </div>
          <div className="col-span-2">
            <p className="font-semibold mb-1">Follow-up Date:</p>
            <p className="border border-gray-200 p-3 rounded bg-gray-50">
              {recordData.followUpDate
                ? format(new Date(recordData.followUpDate), "MMMM dd, yyyy")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-6 border-t-2 border-gray-300 print:border-gray-400">
        <div className="flex justify-end">
          <div className="text-center">
            <div className="h-16 border-b border-gray-400 mb-2"></div>
            <p className="text-sm font-semibold">{recordData.veterinarian}</p>
            <p className="text-xs text-gray-600">License #: VET12345</p>
          </div>
        </div>
        <div className="mt-8 text-xs text-gray-500 text-center print:text-[10px]">
          <p>
            This document is an official medical record. Unauthorized
            duplication is prohibited.
          </p>
          <p className="mt-1">
            © {new Date().getFullYear()} Veterinary Clinic. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.forwardRef(MedicalRecordPrintout);
