import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getBloodReportById } from "../../api/bloodReportService";
import { format } from "date-fns";
import { FiPrinter, FiEdit, FiArrowLeft } from "react-icons/fi";
import "./styles.bloodreport.css";

// Component for the printable content of the blood report
const PrintableBloodReport = ({ report }) => {
  if (!report) {
    return null;
  }

  return (
    <div className="print-content">
      {/* Print-only header */}
      <div className="print-header">
        <h1>SRI VETERINARY CLINIC</h1>
        <p className="clinic-motto">"Where Hands Reach Paws"</p>
        <h2 className="report-title">BLOOD REPORT</h2>
        <div className="report-meta">
          <div className="flex justify-between">
            <span>Patient: {report.patient?.name || "N/A"}</span>
            <span>Date: {format(new Date(), "MMM dd, yyyy")}</span>
          </div>
        </div>
      </div>

      <div className="patient-info">
        <h3 className="section-title">Patient Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <p className="info-label">Patient Name</p>
            <p className="info-value">{report.patient?.name || "N/A"}</p>
          </div>
          <div className="info-item">
            <p className="info-label">Owner Name</p>
            <p className="info-value">
              {report.patient?.client?.owner || "N/A"}
            </p>
          </div>
          <div className="info-item">
            <p className="info-label">Species</p>
            <p className="info-value">{report.patient?.species || "N/A"}</p>
          </div>
          <div className="info-item">
            <p className="info-label">Breed</p>
            <p className="info-value">{report.patient?.breed || "N/A"}</p>
          </div>
          <div className="info-item">
            <p className="info-label">Age</p>
            <p className="info-value">{report.patient?.age || "N/A"}</p>
          </div>
          <div className="info-item">
            <p className="info-label">Sex</p>
            <p className="info-value">{report.patient?.sex || "N/A"}</p>
          </div>
          <div className="info-item">
            <p className="info-label">Pet ID</p>
            <p className="info-value">{report.patient?.petId || "N/A"}</p>
          </div>
          <div className="info-item">
            <p className="info-label">Registration No.</p>
            <p className="info-value">
              {report.patient?.registrationNumber || "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="report-details">
        <div className="info-grid">
          <div className="info-item">
            <p className="info-label">Veterinarian</p>
            <p className="info-value">{report.veterinarian || "N/A"}</p>
          </div>
          <div className="info-item">
            <p className="info-label">Sample Collected</p>
            <p className="info-value">
              {report.sampleCollectedDate
                ? format(new Date(report.sampleCollectedDate), "MMM dd, yyyy")
                : "N/A"}
            </p>
          </div>
          <div className="info-item">
            <p className="info-label">Sample Tested</p>
            <p className="info-value">
              {report.sampleTestedDate
                ? format(new Date(report.sampleTestedDate), "MMM dd, yyyy")
                : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="report-section">
        <h3 className="section-title">HAEMATOLOGY REPORT</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Parameters</th>
                <th>Unit</th>
                <th>Values</th>
                <th>Dog</th>
                <th>Cat</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" className="table-section-header">
                  Complete Blood Cell Count
                </td>
              </tr>
              <tr>
                <td>Hb</td>
                <td>gm/dL</td>
                <td className="value-cell">{report.hematology?.hb || "-"}</td>
                <td>12.4 - 19.1</td>
                <td>9.8 – 15.4</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">PCV</td>
                <td className="px-5 py-3 text-gray-800">%</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.hematology?.pcv || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">35 - 57</td>
                <td className="px-5 py-3 text-gray-700">30 - 45</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">RBC</td>
                <td className="px-5 py-3 text-gray-800">10^6/µL</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.hematology?.rbc || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">5.5 - 8.5</td>
                <td className="px-5 py-3 text-gray-700">5.0 - 10.0</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">MCV</td>
                <td className="px-5 py-3 text-gray-800">fL</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.hematology?.mcv || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">60 - 77</td>
                <td className="px-5 py-3 text-gray-700">39 - 55</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">MCH</td>
                <td className="px-5 py-3 text-gray-800">pg</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.hematology?.mch || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">20 - 25</td>
                <td className="px-5 py-3 text-gray-700">13 - 17</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">MCHC</td>
                <td className="px-5 py-3 text-gray-800">g/dL</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.hematology?.mchc || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">32 - 36</td>
                <td className="px-5 py-3 text-gray-700">31 - 35</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">Platelets</td>
                <td className="px-5 py-3 text-gray-800">1000/µL</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.hematology?.platelets || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">200 - 500</td>
                <td className="px-5 py-3 text-gray-700">300 - 700</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">TLC</td>
                <td className="px-5 py-3 text-gray-800">1000/µL</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.hematology?.tlc || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">6.0 - 17.0</td>
                <td className="px-5 py-3 text-gray-700">5.5 - 19.5</td>
              </tr>

              <tr>
                <td
                  colSpan="5"
                  className="font-bold bg-orange-50 text-orange-800 px-5 py-3"
                >
                  Differential Leukocyte Count
                </td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">Neutrophils</td>
                <td className="px-5 py-3 text-gray-800">%</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.hematology?.neutrophils || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">60 - 75</td>
                <td className="px-5 py-3 text-gray-700">35 - 75</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">Lymphocytes</td>
                <td className="px-5 py-3 text-gray-800">%</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.hematology?.lymphocytes || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">12 - 30</td>
                <td className="px-5 py-3 text-gray-700">20 - 55</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">Monocytes</td>
                <td className="px-5 py-3 text-gray-800">%</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.hematology?.monocytes || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">3 - 10</td>
                <td className="px-5 py-3 text-gray-700">1 - 4</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">Eosinophils</td>
                <td className="px-5 py-3 text-gray-800">%</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.hematology?.eosinophils || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">2 - 10</td>
                <td className="px-5 py-3 text-gray-700">2 - 12</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">Basophils</td>
                <td className="px-5 py-3 text-gray-800">%</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.hematology?.basophils || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">0 - 1</td>
                <td className="px-5 py-3 text-gray-700">0 - 1</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="report-section mb-10">
        <h3 className="section-title text-xl font-bold text-gray-800 pb-3 mb-5 border-b border-gray-200">
          CLINICAL CHEMISTRY
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-700">
                  Parameters
                </th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-700">
                  Unit
                </th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-700">
                  Values
                </th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-700">
                  Dog
                </th>
                <th className="px-5 py-3 text-left text-sm font-semibold text-gray-700">
                  Cat
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">Glucose (RBS)</td>
                <td className="px-5 py-3 text-gray-800">mg/dL</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.clinicalChemistry?.glucose || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">75 - 125</td>
                <td className="px-5 py-3 text-gray-700">78 - 135</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">BUN</td>
                <td className="px-5 py-3 text-gray-800">mg/dL</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.clinicalChemistry?.bun || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">7 - 27</td>
                <td className="px-5 py-3 text-gray-700">16 - 36</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">Creatinine</td>
                <td className="px-5 py-3 text-gray-800">mg/dL</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.clinicalChemistry?.creatinine || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">0.5 - 1.5</td>
                <td className="px-5 py-3 text-gray-700">0.8 - 1.8</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">ALT (SGPT)</td>
                <td className="px-5 py-3 text-gray-800">U/L</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.clinicalChemistry?.alt || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">10 - 100</td>
                <td className="px-5 py-3 text-gray-700">20 - 100</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">ALP</td>
                <td className="px-5 py-3 text-gray-800">U/L</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.clinicalChemistry?.alp || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">20 - 150</td>
                <td className="px-5 py-3 text-gray-700">10 - 100</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">Total Protein</td>
                <td className="px-5 py-3 text-gray-800">gm/dL</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.clinicalChemistry?.totalProtein || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">5.5 - 7.5</td>
                <td className="px-5 py-3 text-gray-700">6.0 - 8.0</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">Albumin</td>
                <td className="px-5 py-3 text-gray-800">gm/dL</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.clinicalChemistry?.albumin || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">2.5 - 4.0</td>
                <td className="px-5 py-3 text-gray-700">2.8 - 4.2</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">Total Bilirubin</td>
                <td className="px-5 py-3 text-gray-800">mg/dL</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.clinicalChemistry?.bilirubinTotal || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">0.1 - 0.6</td>
                <td className="px-5 py-3 text-gray-700">0.1 - 0.5</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">Direct Bilirubin</td>
                <td className="px-5 py-3 text-gray-800">mg/dL</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.clinicalChemistry?.bilirubinDirect || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">0.0 - 0.2</td>
                <td className="px-5 py-3 text-gray-700">0.0 - 0.2</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">Sodium</td>
                <td className="px-5 py-3 text-gray-800">mEq/L</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.clinicalChemistry?.sodium || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">140 - 152</td>
                <td className="px-5 py-3 text-gray-700">145 - 158</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">Potassium</td>
                <td className="px-5 py-3 text-gray-800">mEq/L</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.clinicalChemistry?.potassium || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">3.5 - 5.5</td>
                <td className="px-5 py-3 text-gray-700">3.5 - 5.0</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">Chloride</td>
                <td className="px-5 py-3 text-gray-800">mEq/L</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.clinicalChemistry?.chloride || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">105 - 115</td>
                <td className="px-5 py-3 text-gray-700">110 - 120</td>
              </tr>
              <tr className="border-t border-gray-200">
                <td className="px-5 py-3 text-gray-800">Vitamin D</td>
                <td className="px-5 py-3 text-gray-800">ng/ml</td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  {report.clinicalChemistry?.vitaminD || "-"}
                </td>
                <td className="px-5 py-3 text-gray-700">20 - 100</td>
                <td className="px-5 py-3 text-gray-700">20 - 100</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {report.notes && (
        <div className="notes-section">
          <h3 className="section-title">Notes</h3>
          <div className="notes-content">
            <p>{report.notes}</p>
          </div>
        </div>
      )}

      <div className="footer">
        <p>
          Report generated on: {format(new Date(), "MMM dd, yyyy 'at' h:mm a")}
        </p>
      </div>
    </div>
  );
};
const BloodReportView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getBloodReportById(id);
        setReport(data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch blood report");
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-orange-100 rounded-xl text-center shadow-md mt-10 border border-orange-200">
        <h2 className="text-xl font-bold text-orange-700 mb-4">Error</h2>
        <p className="text-gray-800 mb-6">{error}</p>
        <Link
          to="/blood-reports"
          className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition duration-200"
        >
          Back to Reports
        </Link>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-md mx-auto p-6 bg-gray-100 rounded-xl shadow-sm text-center mt-10 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Report Not Found
        </h2>
        <p className="text-gray-700 mb-6">Blood report not found.</p>
        <Link
          to="/blood-reports"
          className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition duration-200"
        >
          Back to Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="blood-report-view">
      <div className="report-actions no-print">
        {" "}
        <h1>Blood Report</h1>
        <div className="action-buttons">
          <Link onClick={() => navigate(-1)} className="back-button">
            <FiArrowLeft /> Back to List
          </Link>
          <Link to={`/blood-reports/${id}/edit`} className="edit-button">
            <FiEdit /> Edit Report
          </Link>
          <button onClick={handlePrint} className="print-button">
            <FiPrinter /> Print Report
          </button>
        </div>
      </div>

      <PrintableBloodReport report={report} />
    </div>
  );
};

export default BloodReportView;
