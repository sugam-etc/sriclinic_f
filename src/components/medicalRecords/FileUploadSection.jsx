// src/components/medicalRecords/FileUploadSection.jsx
import { useState } from "react";

export const FileUploadSection = ({ recordData, setRecordData }) => {
  const [uploadProgress, setUploadProgress] = useState({});

  const handleFileChange = (e, fileType) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const updatedFiles = files.map((file) => ({
      fileName: file.name,
      fileType: file.type,
      file, // Store the actual file object
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));

    setRecordData((prev) => ({
      ...prev,
      [fileType]: [...(prev[fileType] || []), ...updatedFiles],
    }));
  };

  const removeFile = (fileType, index) => {
    setRecordData((prev) => {
      const updatedFiles = [...prev[fileType]];
      updatedFiles.splice(index, 1);
      return { ...prev, [fileType]: updatedFiles };
    });
  };

  const fileTypes = [
    { name: "consentForms", label: "Consent Forms" },
    { name: "medicalReportFiles", label: "Medical Reports" },
    { name: "surgeryReportFiles", label: "Surgery Reports" },
    { name: "vaccinationReportFiles", label: "Vaccination Reports" },
  ];

  return (
    <div className="space-y-6 bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <h3 className="text-2xl font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-4">
        File Attachments
      </h3>

      {fileTypes.map(({ name, label }) => (
        <div key={name} className="space-y-3 mb-4 last:mb-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <label className="block text-base font-medium text-gray-700 mb-2 sm:mb-0">
              {label}
            </label>
            <input
              type="file"
              id={name}
              multiple
              onChange={(e) => handleFileChange(e, name)}
              className="hidden"
            />
            <label
              htmlFor={name}
              className="px-5 py-2 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 cursor-pointer shadow-md transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              Add Files
            </label>
          </div>

          {recordData[name]?.length > 0 && (
            <div className="space-y-2 mt-3">
              {recordData[name].map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt="Preview"
                        className="w-12 h-12 object-cover rounded-md border border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded-md">
                        <span className="text-xs text-gray-600 font-medium">
                          DOC
                        </span>
                      </div>
                    )}
                    <span className="text-sm text-gray-800 truncate max-w-[calc(100%-80px)] sm:max-w-xs md:max-w-md">
                      {file.fileName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(name, index)}
                    className="text-red-500 hover:text-red-700 text-xl ml-4"
                    aria-label="Remove file"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
