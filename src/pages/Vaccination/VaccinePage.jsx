import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { vaccinationService } from "../../api/vaccinationService";
import { Printer, FileText, X } from "react-feather"; // Using react-feather icons
import { FaAlignLeft } from "react-icons/fa";
import { FaLeftLong } from "react-icons/fa6";

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Main VaccineDetail component
const VaccineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vaccination, setVaccination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFile, setModalFile] = useState(null);
  const componentRef = useRef();

  useEffect(() => {
    const fetchVaccination = async () => {
      try {
        const data = await vaccinationService.getVaccinationById(id);
        setVaccination(data);
        console.log(data);
      } catch (err) {
        setError("Failed to load vaccination details. Please try again.");
        console.error("Error fetching vaccination:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVaccination();
    } else {
      setLoading(false);
      setError("No vaccination ID provided.");
    }
  }, [id]);

  const handlePrint = () => {
    const printContent = componentRef.current;
    const printWindow = window.open("", "_blank");

    // Create a clean HTML document for printing
    printWindow.document.write(`
    <html>
      <head>
        <title>Vaccination Record</title>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          @media print {
            body { margin: 0; padding: 20px; }
            .no-print { display: none !important; }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
        <script>
          // Trigger print after content loads
          setTimeout(() => {
            window.print();
            window.onafterprint = () => window.close();
          }, 500);
        </script>
      </body>
    </html>
  `);

    printWindow.document.close();
  };

  const openFileModal = (file) => {
    setModalFile(file);
    setIsModalOpen(true);
  };

  const closeFileModal = () => {
    setIsModalOpen(false);
    setModalFile(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-orange-500 text-lg">
          Loading vaccination details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  if (!vaccination) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-gray-700 text-lg">
          Vaccination record not found.
        </div>
      </div>
    );
  }

  const {
    patient,
    vaccineName,
    dateAdministered,
    nextDueDate,
    manufacturer,
    batchNumber,
    administeringVeterinarian,
    notes,
    isBooster,
    routeOfAdministration,
    reactionObserved,
  } = vaccination;

  const allFiles = [
    ...(vaccination.medicalReportFiles || []),
    ...(vaccination.vaccinationReportFiles || []),
  ];

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div
        ref={componentRef}
        className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 sm:p-8 my-8 border border-gray-200"
      >
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-orange-500 mb-1">
              Vaccination Record
            </h1>
            <p className="text-lg text-gray-600">Detailed Information</p>
          </div>
          <div className="flex justify-between gap-4">
            <button
              onClick={() => navigate(-1)}
              className="no-print bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-150 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <FaLeftLong size={20} />
              <span>Back</span>
            </button>
            <button
              onClick={handlePrint}
              className="no-print bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-5 rounded-lg shadow-md transition duration-150 flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <Printer size={20} />
              <span>Print Record</span>
            </button>
          </div>
        </div>

        {/* Patient Information Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-orange-300 pb-2">
            Patient Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 text-base">
            <div>
              <p>
                <span className="font-semibold text-gray-900">
                  Patient Name:
                </span>{" "}
                {patient?.name || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Species:</span>{" "}
                {patient?.species || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Breed:</span>{" "}
                {patient?.breed || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Age:</span>{" "}
                {patient?.age || "N/A"}
              </p>
            </div>
            <div>
              <p>
                <span className="font-semibold text-gray-900">Pet ID:</span>{" "}
                {patient?.petId || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-gray-900">
                  Registration No.:
                </span>{" "}
                {patient?.registrationNumber || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Owner Name:</span>{" "}
                {patient?.client?.owner || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-gray-900">
                  Owner Contact:
                </span>{" "}
                {patient?.client?.contact || "N/A"}
              </p>
            </div>
          </div>
        </section>

        {/* Vaccination Details Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-orange-300 pb-2">
            Vaccination Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 text-base">
            <div>
              <p>
                <span className="font-semibold text-gray-900">
                  Vaccine Name:
                </span>{" "}
                {vaccineName || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-gray-900">
                  Date Administered:
                </span>{" "}
                {formatDate(dateAdministered)}
              </p>
              <p>
                <span className="font-semibold text-gray-900">
                  Next Due Date:
                </span>{" "}
                {formatDate(nextDueDate)}
              </p>
              <p>
                <span className="font-semibold text-gray-900">
                  Manufacturer:
                </span>{" "}
                {manufacturer || "N/A"}
              </p>
            </div>
            <div>
              <p>
                <span className="font-semibold text-gray-900">
                  Batch Number:
                </span>{" "}
                {batchNumber || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-gray-900">
                  Administering Vet:
                </span>{" "}
                {administeringVeterinarian || "N/A"}
              </p>
              <p>
                <span className="font-semibold text-gray-900">Booster:</span>{" "}
                {isBooster ? "Yes" : "No"}
              </p>
              <p>
                <span className="font-semibold text-gray-900">
                  Route of Admin.:
                </span>{" "}
                {routeOfAdministration || "N/A"}
              </p>
            </div>
          </div>
          <div className="mt-4 text-gray-700 text-base">
            <p>
              <span className="font-semibold text-gray-900">
                Reaction Observed:
              </span>{" "}
              {reactionObserved || "None"}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Notes:</span>{" "}
              {notes || "No additional notes."}
            </p>
          </div>
        </section>

        {/* Uploaded Files Section */}
        <section className="mb-8 no-print">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b border-orange-300 pb-2">
            Uploaded Files
          </h2>
          {allFiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allFiles.map((file, index) => (
                <div
                  key={index}
                  className="bg-orange-50 border border-orange-300 rounded-md p-3 flex items-center justify-between shadow-sm cursor-pointer hover:bg-orange-100 transition duration-150"
                  onClick={() => openFileModal(file)}
                >
                  <div className="flex items-center">
                    <FileText size={18} className="text-orange-600 mr-2" />
                    <span className="text-orange-800 text-sm font-medium truncate">
                      {file.fileName}
                    </span>
                  </div>
                  <span className="text-xs text-orange-500">
                    {file.fileType}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-base">
              No files uploaded for this vaccination record.
            </p>
          )}
        </section>

        {/* Footer Section */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} Veterinary Clinic. All rights
            reserved.
          </p>
        </div>
      </div>

      {/* File Preview Modal - Simplified with Tailwind */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={closeFileModal}
          ></div>
          <div className="relative w-full max-w-3xl max-h-[90vh] rounded-lg bg-white shadow-xl flex flex-col z-10">
            <div className="flex justify-between items-center mb-4 border-b p-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalFile?.fileName || "File Preview"}
              </h2>
              <button
                onClick={closeFileModal}
                className="p-2 rounded-full hover:bg-gray-100 transition duration-150"
              >
                <X size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="flex-grow overflow-auto bg-gray-50 rounded-md p-4 flex items-center justify-center">
              {modalFile && modalFile.fileType.startsWith("image/") ? (
                <img
                  src={modalFile.filePath}
                  alt={modalFile.fileName}
                  className="max-w-full max-h-[70vh] object-contain rounded-md shadow-sm"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/600x400/cccccc/333333?text=Image+Load+Error";
                  }}
                />
              ) : modalFile.fileType === "application/pdf" ? (
                <iframe
                  src={modalFile.filePath}
                  title={modalFile.fileName}
                  className="w-full h-[70vh] border-0 rounded-md"
                />
              ) : (
                <div className="text-center text-gray-500">
                  <FileText size={48} className="mx-auto mb-3 text-gray-400" />
                  <p>No preview available for this file type.</p>
                  <a
                    href={modalFile.filePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-500 hover:underline mt-2 inline-block"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VaccineDetail;
