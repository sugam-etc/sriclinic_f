import React, { useState } from "react";
// import { medicalRecordService } from "../../api/medicalRecordService";
import { BACKEND_URL } from "../../config";

const FileList = ({
  files,
  recordId,
  fileType,
  onDelete,
  onDownload,
  onDeleteFile,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  const openModal = (file) => {
    setSelectedFile(file);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedFile(null);
  };

  const handleDeleteClick = (file) => {
    setFileToDelete(file);
    setConfirmDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (fileToDelete) {
      await onDeleteFile(fileType, fileToDelete._id);
      setConfirmDeleteModal(false);
      setFileToDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteModal(false);
    setFileToDelete(null);
  };

  if (!files || files.length === 0) {
    return (
      <p className="text-gray-500 text-sm italic py-2 px-4 rounded-lg bg-gray-50 border border-gray-200">
        No files uploaded yet for this section.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
      {files.map((file, index) => (
        <div
          key={file._id || index}
          className="relative flex flex-col items-center justify-between bg-white p-4 rounded-xl shadow-md border border-gray-200 transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1"
        >
          {/* File Preview/Icon */}
          <div
            className="flex items-center justify-center w-full h-24 bg-gray-100 rounded-lg mb-3 cursor-pointer overflow-hidden"
            onClick={() => openModal(file)}
          >
            {file.fileType?.startsWith("image/") ? (
              <img
                src={`${BACKEND_URL}${file.filePath}`}
                alt={file.fileName}
                className="max-w-full max-h-full object-contain rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/100x100/E5E7EB/4B5563?text=IMG";
                }}
              />
            ) : file.fileType === "application/pdf" ? (
              <div className="flex flex-col items-center justify-center text-red-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-10 h-10 mb-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z"
                  />
                </svg>
                <span className="text-xs font-semibold text-gray-600">PDF</span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-orange-600 text-opacity-80">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-10 h-10 mb-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25m-9-4.5h5.25"
                  />
                </svg>
                <span className="text-xs font-semibold text-gray-600">
                  {file.fileType
                    ? file.fileType.split("/")[1]?.toUpperCase() || "FILE"
                    : "FILE"}
                </span>
              </div>
            )}
          </div>

          {/* File Name */}
          <span className="text-sm font-medium text-gray-800 text-center w-full truncate mb-3 px-2">
            {file.fileName}
          </span>

          {/* Actions */}
          <div className="flex space-x-3 w-full justify-center">
            <button
              onClick={() => onDownload(fileType, file._id, file.fileName)}
              className="flex items-center justify-center p-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors duration-200"
              title="Download File"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                />
              </svg>
            </button>
            <button
              onClick={() => handleDeleteClick(file)}
              className="flex items-center justify-center p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors duration-200"
              title="Delete File"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.925a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m-1.022.165 1.12 12.115A2.25 2.25 0 0 0 8.925 21h6.15c1.156 0 2.062-.906 2.062-2.077L19.19 5.79m0 0A.75.75 0 0 0 18.97 4.75h-.922c-.233 0-.453.102-.64.288L15 7.125m-8.48 0 .427-.427A.75.75 0 0 0 6.31 4.75H5.388a.75.75 0 0 0-.742.64l-1.12 12.115M16.5 7.125h-9"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}

      {/* File Preview Modal */}
      {showModal && selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-xl font-semibold text-gray-800 truncate">
                {selectedFile.fileName}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-800 text-3xl leading-none font-light"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            <div className="flex-grow flex items-center justify-center overflow-auto p-2">
              {selectedFile.fileType?.startsWith("image/") ? (
                <img
                  // src={`/api/medical-records/${recordId}/files/${fileType}/${selectedFile._id}/download`}
                  src={`${BACKEND_URL}${selectedFile.filePath}`}
                  alt={selectedFile.fileName}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/400x300/E5E7EB/4B5563?text=Image+Load+Error";
                  }}
                />
              ) : selectedFile.fileType === "application/pdf" ? (
                <div className="w-full h-full">
                  <iframe
                    // src={`/api/medical-records/${recordId}/files/${fileType}/${selectedFile._id}/download#view=fitH`}
                    src={`${BACKEND_URL}${selectedFile.filePath}`}
                    title={selectedFile.fileName}
                    className="w-full h-full min-h-[500px] rounded-lg border border-gray-300"
                    frameBorder="0"
                  >
                    <p className="text-center text-gray-600">
                      Your browser does not support PDFs. You can{" "}
                      <a
                        href={`/api/medical-records/${recordId}/files/${fileType}/${selectedFile._id}/download`}
                        download
                        className="text-orange-600 hover:underline"
                      >
                        download the PDF
                      </a>{" "}
                      instead.
                    </p>
                  </iframe>
                </div>
              ) : (
                <div className="text-center text-gray-600 p-8 border border-gray-300 rounded-lg bg-gray-50">
                  <p className="text-lg font-medium mb-2">
                    No preview available
                  </p>
                  <p className="text-sm">
                    This file type ({selectedFile.fileType || "unknown"}) cannot
                    be displayed directly.
                  </p>
                  <button
                    onClick={() =>
                      onDownload(
                        fileType,
                        selectedFile._id,
                        selectedFile.fileName
                      )
                    }
                    className="mt-4 px-5 py-2.5 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors shadow-md"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t flex justify-end">
              <button
                onClick={() =>
                  onDownload(fileType, selectedFile._id, selectedFile.fileName)
                }
                className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors shadow-md"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deletion */}
      {confirmDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{fileToDelete?.fileName}"? This
              action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={cancelDelete}
                className="px-6 py-2.5 rounded-xl font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2.5 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileList;
