// SurgeryReportPage.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { surgeryService } from "../../api/surgeryService";
import { format } from "date-fns";
import "./style.surgeryreport.css";
// import ClinicLogo from "../../assets/clinic-logo.png";
import ClinicLogo from "../../assets/clinic.jpg";
import { FaArrowLeft } from "react-icons/fa6";

const SurgeryReportPage = () => {
  const { id } = useParams();
  const [surgery, setSurgery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const reportRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchSurgery = async () => {
      try {
        const data = await surgeryService.getSurgeryById(id);
        setSurgery(data);
      } catch (err) {
        setError(err.message || "Failed to fetch surgery details");
      } finally {
        setLoading(false);
      }
    };

    fetchSurgery();
  }, [id]);

  const handlePrint = () => {
    if (reportRef.current) {
      const printContent = reportRef.current.innerHTML;
      // Get the CSS content directly from the DOM or a known source
      // For simplicity, we'll assume the CSS is loaded and can be retrieved.
      // In a real application, you might fetch it or have it bundled.
      const styleSheet = document.querySelector(
        'link[href*="style.surgeryreport.css"]'
      );
      let cssContent = "";
      if (styleSheet) {
        // Attempt to fetch the CSS content if it's an external stylesheet
        // Note: This might be blocked by CORS if the stylesheet is on a different origin.
        // For local development or same-origin, this should work.
        fetch(styleSheet.href)
          .then((response) => response.text())
          .then((text) => {
            cssContent = text;
            openPrintWindow(printContent, cssContent);
          })
          .catch((err) => {
            console.error("Failed to load CSS for printing:", err);
            // Fallback to opening print window without external CSS if fetch fails
            openPrintWindow(printContent, "");
          });
      } else {
        // If the stylesheet link isn't found, open print window without external CSS
        openPrintWindow(printContent, "");
      }
    }
  };

  const openPrintWindow = (content, css) => {
    try {
      const printWindow = window.open("", "", "width=800,height=600");
      if (!printWindow) {
        // This likely means the pop-up blocker prevented the window from opening
        alert(
          "Pop-up blocked! Please allow pop-ups for this site to print the report."
        );
        return;
      }
      printWindow.document.write(`
        <html>
          <head>
            <title>Surgery Report</title>
            <style>
              /* Inlined CSS for reliable printing */
              ${css}
              /* Additional print-specific styles */
              body { margin: 0; padding: 0; }
              .print-only { display: block !important; }
              .no-print { display: none !important; }
              @page { size: A4; margin: 15mm; }
              body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus(); // Focus the new window
      printWindow.print(); // Trigger the print dialog
    } catch (e) {
      console.error("Error opening print window:", e);
      alert("Could not open print window. Please check your browser settings.");
    }
  };

  const openFileModal = (file) => {
    setSelectedFile(file);
  };

  const closeFileModal = () => {
    setSelectedFile(null);
  };

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error-alert">{error}</div>;
  }

  if (!surgery) {
    return <div className="warning-alert">Surgery not found</div>;
  }

  return (
    <div className="report-container" ref={reportRef}>
      {/* Screen Header */}
      <div className="report-header-section no-print">
        <h1 className="report-title">Surgery Report</h1>
        <div className="flex gap-4">
          <button className="print-button" onClick={() => navigate(-1)}>
            <FaArrowLeft size={24} />
          </button>
          <button className="print-button" onClick={handlePrint}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 9V2H18V9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 18H4C2.89543 18 2 17.1046 2 16V11C2 9.89543 2.89543 9 4 9H20C21.1046 9 22 9.89543 22 11V16C22 17.1046 21.1046 18 20 18H18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M18 14H6V22H18V14Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Print Report
          </button>
        </div>
      </div>

      {/* Print Header */}
      <div className="print-header-section print-only">
        {/* <img src={ClinicLogo} alt="Clinic Logo" className="clinic-logo" /> */}
        <h1 className="clinic-title">SRI VETERINARY CLINIC</h1>
        <h2 className="report-subtitle">SURGERY REPORT</h2>
        <hr className="header-divider" />
      </div>

      {/* Patient Information */}
      <div className="info-card section-patient-info">
        <div className="card-header">
          <h5 className="section-title">Patient Information</h5>
        </div>
        <div className="card-body">
          <table className="info-table">
            <tbody>
              <tr>
                <td className="table-header-cell">Patient Name:</td>
                <td className="table-data-cell">
                  {surgery.patient?.name || "N/A"}
                </td>
              </tr>
              <tr>
                <td className="table-header-cell">Species:</td>
                <td className="table-data-cell">
                  {surgery.patient?.species || "N/A"}
                </td>
              </tr>
              <tr>
                <td className="table-header-cell">Breed:</td>
                <td className="table-data-cell">
                  {surgery.patient?.breed || "N/A"}
                </td>
              </tr>
              <tr>
                <td className="table-header-cell">Age:</td>
                <td className="table-data-cell">
                  {surgery.patient?.age || "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Surgery Details */}
      <div className="info-card section-surgery-details">
        <div className="card-header">
          <h5 className="section-title">Surgery Details</h5>
        </div>
        <div className="card-body">
          <table className="info-table">
            <tbody>
              <tr>
                <td className="table-header-cell">Surgery Type:</td>
                <td className="table-data-cell">
                  {surgery.surgeryType || "N/A"}
                </td>
              </tr>
              <tr>
                <td className="table-header-cell">Date:</td>
                <td className="table-data-cell">
                  {surgery.surgeryDate
                    ? format(new Date(surgery.surgeryDate), "MMMM dd, yyyy")
                    : "N/A"}
                </td>
              </tr>
              <tr>
                <td className="table-header-cell">Veterinarian:</td>
                <td className="table-data-cell">
                  {surgery.veterinarian || "N/A"}
                </td>
              </tr>
              <tr>
                <td className="table-header-cell">Anesthesia Type:</td>
                <td className="table-data-cell">
                  {surgery.anesthesiaType || "N/A"}
                </td>
              </tr>
              <tr>
                <td className="table-header-cell">Duration:</td>
                <td className="table-data-cell">
                  {surgery.duration ? `${surgery.duration} minutes` : "N/A"}
                </td>
              </tr>
              <tr>
                <td className="table-header-cell">Follow-up Date:</td>
                <td className="table-data-cell">
                  {surgery.followUpDate
                    ? format(new Date(surgery.followUpDate), "MMMM dd, yyyy")
                    : "N/A"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Complications */}
      {surgery.complications && (
        <div className="info-card section-complications">
          <div className="card-header">
            <h5 className="section-title">Complications</h5>
          </div>
          <div className="card-body">
            <p className="section-content">{surgery.complications}</p>
          </div>
        </div>
      )}

      {/* Notes */}
      {surgery.notes && (
        <div className="info-card section-notes">
          <div className="card-header">
            <h5 className="section-title">Notes</h5>
          </div>
          <div className="card-body">
            <p className="section-content">{surgery.notes}</p>
          </div>
        </div>
      )}

      {/* Prescribed Medications */}
      {surgery.medications && surgery.medications.length > 0 && (
        <div className="info-card section-medications">
          <div className="card-header">
            <h5 className="section-title">Prescribed Medications</h5>
          </div>
          <div className="card-body">
            <table className="medication-table">
              <thead>
                <tr>
                  <th className="med-table-header-cell">Medication</th>
                  <th className="med-table-header-cell">Dosage</th>
                  <th className="med-table-header-cell">Frequency</th>
                  <th className="med-table-header-cell">Duration</th>
                </tr>
              </thead>
              <tbody>
                {surgery.medications.map((med, index) => (
                  <tr key={index}>
                    <td className="med-table-data-cell">{med.name || "N/A"}</td>
                    <td className="med-table-data-cell">
                      {med.dosage || "N/A"}
                    </td>
                    <td className="med-table-data-cell">
                      {med.frequency || "N/A"}
                    </td>
                    <td className="med-table-data-cell">
                      {med.duration || "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attached Files */}
      {surgery.files && surgery.files.length > 0 && (
        <div className="info-card section-files">
          <div className="card-header">
            <h5 className="section-title">Attached Files</h5>
          </div>
          <div className="card-body">
            <div className="file-preview-grid">
              {surgery.files.map((file, index) => (
                <div
                  key={index}
                  className="file-preview-item"
                  onClick={() => openFileModal(file)}
                >
                  <div className="file-preview-thumbnail">
                    {file.type.startsWith("image/") ? (
                      <img src={file.url} alt={file.name} />
                    ) : (
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                          stroke="var(--dark-gray)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14 2V8H20"
                          stroke="var(--dark-gray)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 13H8"
                          stroke="var(--dark-gray)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16 17H8"
                          stroke="var(--dark-gray)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 9H9H8"
                          stroke="var(--dark-gray)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="file-preview-info">{file.name}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Print Button */}
      <div
        className="no-print"
        style={{ textAlign: "center", marginTop: "var(--spacing-xl)" }}
      >
        <button className="print-button" onClick={handlePrint}>
          Print Report
        </button>
      </div>

      {/* Report Generated Info */}
      <div className="report-generated-info print-only">
        <p>
          Report generated on: {format(new Date(), "MMMM dd, yyyy hh:mm a")}
        </p>
        <p className="clinic-address">
          123 Veterinary Lane, Animal City, AC 12345 | Phone: (123) 456-7890
        </p>
      </div>

      {/* File Preview Modal */}
      {selectedFile && (
        <div className="modal-overlay" onClick={closeFileModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeFileModal}>
              &times;
            </button>
            {selectedFile.type.startsWith("image/") ? (
              <img
                src={selectedFile.url}
                alt={selectedFile.name}
                className="modal-image"
              />
            ) : (
              <iframe
                src={selectedFile.url}
                title={selectedFile.name}
                className="modal-document"
              ></iframe>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SurgeryReportPage;
