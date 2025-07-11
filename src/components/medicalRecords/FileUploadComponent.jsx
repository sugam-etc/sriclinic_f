import React from "react";
import FileUploadButton from "./FileUploadButton";
import FileList from "./FileList";

const FileUploadComponent = ({
  recordId,
  recordData,
  refreshRecord,
  onDownload,
  onDeleteFile,
}) => {
  const SectionCard = ({ title, children }) => (
    <div className="space-y-6 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <h3 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-4">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Consent Forms */}
      <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
          <h3 className="font-medium text-lg text-gray-800 mb-2 sm:mb-0">
            Consent Forms
          </h3>
          <FileUploadButton
            recordId={recordId}
            fileType="consentForm"
            onUploadSuccess={refreshRecord}
            buttonText="Add Consent Form"
          />
        </div>
        {recordData.consentForms?.length > 0 ? (
          <FileList
            files={recordData.consentForms}
            recordId={recordId}
            fileType="consentForms"
            onDelete={refreshRecord}
            onDownload={onDownload}
            onDeleteFile={onDeleteFile}
          />
        ) : (
          <p className="text-gray-500 text-sm italic">
            No consent forms uploaded yet.
          </p>
        )}
      </div>

      {/* Medical Reports */}
      <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
          <h3 className="font-medium text-lg text-gray-800 mb-2 sm:mb-0">
            Medical Reports
          </h3>
          <FileUploadButton
            recordId={recordId}
            fileType="medicalReport"
            onUploadSuccess={refreshRecord}
            buttonText="Add Medical Report"
          />
        </div>
        {recordData.medicalReportFiles?.length > 0 ? (
          <FileList
            files={recordData.medicalReportFiles}
            recordId={recordId}
            fileType="medicalReportFiles"
            onDelete={refreshRecord}
            onDownload={onDownload}
            onDeleteFile={onDeleteFile}
          />
        ) : (
          <p className="text-gray-500 text-sm italic">
            No medical reports uploaded yet.
          </p>
        )}
      </div>

      {/* Surgery Reports */}
      <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
          <h3 className="font-medium text-lg text-gray-800 mb-2 sm:mb-0">
            Surgery Reports
          </h3>
          <FileUploadButton
            recordId={recordId}
            fileType="surgeryReport"
            onUploadSuccess={refreshRecord}
            buttonText="Add Surgery Report"
          />
        </div>
        {recordData.surgeryReportFiles?.length > 0 ? (
          <FileList
            files={recordData.surgeryReportFiles}
            recordId={recordId}
            fileType="surgeryReportFiles"
            onDelete={refreshRecord}
            onDownload={onDownload}
            onDeleteFile={onDeleteFile}
          />
        ) : (
          <p className="text-gray-500 text-sm italic">
            No surgery reports uploaded yet.
          </p>
        )}
      </div>

      {/* Vaccination Reports */}
      <div className="p-4 border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
          <h3 className="font-medium text-lg text-gray-800 mb-2 sm:mb-0">
            Vaccination Reports
          </h3>
          <FileUploadButton
            recordId={recordId}
            fileType="vaccinationReport"
            onUploadSuccess={refreshRecord}
            buttonText="Add Vaccination Report"
          />
        </div>
        {recordData.vaccinationReportFiles?.length > 0 ? (
          <FileList
            files={recordData.vaccinationReportFiles}
            recordId={recordId}
            fileType="vaccinationReportFiles"
            onDelete={refreshRecord}
            onDownload={onDownload}
            onDeleteFile={onDeleteFile}
          />
        ) : (
          <p className="text-gray-500 text-sm italic">
            No vaccination reports uploaded yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default FileUploadComponent;
