import React, { useState } from "react";
import { medicalRecordService } from "../../api/medicalRecordService";

const FileUploadButton = ({
  recordId,
  fileType,
  onUploadSuccess,
  buttonText,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      let response;
      switch (fileType) {
        case "consentForm":
          response = await medicalRecordService.addConsentForm(recordId, file);
          break;
        case "medicalReport":
          response = await medicalRecordService.addMedicalReportFile(
            recordId,
            file
          );
          break;
        case "surgeryReport":
          response = await medicalRecordService.addSurgeryReportFile(
            recordId,
            file
          );
          break;
        case "vaccinationReport":
          response = await medicalRecordService.addVaccinationReportFile(
            recordId,
            file
          );
          break;
        default:
          throw new Error("Invalid file type");
      }

      onUploadSuccess(response);
    } catch (err) {
      setError(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="file-upload-button">
      <label className="inline-flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl cursor-pointer text-sm font-semibold shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50">
        {isUploading ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Uploading...
          </span>
        ) : (
          buttonText
        )}
        <input
          type="file"
          onChange={handleFileUpload}
          style={{ display: "none" }}
          disabled={isUploading}
        />
      </label>
      {error && (
        <div className="text-red-500 text-xs mt-2 text-center">{error}</div>
      )}
    </div>
  );
};

export default FileUploadButton;
