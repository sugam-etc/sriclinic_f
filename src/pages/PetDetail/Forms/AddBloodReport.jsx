import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getBloodReportById,
  createBloodReport,
  updateBloodReport,
} from "../../../api/bloodReportService";
import { patientService } from "../../../api/patientService";
import { format } from "date-fns";
import { useReactToPrint } from "react-to-print";

const BloodReportForm = ({
  patientId,
  onSave,
  onCancel,
  existingReportId: propReportId,
}) => {
  const { id: paramReportId } = useParams();
  const existingReportId = propReportId || paramReportId;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [patientData, setPatientData] = useState(null);
  const formRef = React.useRef();

  const [formData, setFormData] = useState({
    veterinarian: "",
    sampleCollectedDate: format(new Date(), "yyyy-MM-dd"),
    sampleTestedDate: format(new Date(), "yyyy-MM-dd"),
    hematology: {
      hb: "",
      pcv: "",
      tlc: "",
      neutrophils: "",
      eosinophils: "",
      basophils: "",
      monocytes: "",
      lymphocytes: "",
      rbc: "",
      platelets: "",
      mchc: "",
      mch: "",
      mcv: "",
    },
    clinicalChemistry: {
      glucose: "",
      albumin: "",
      totalProtein: "",
      bilirubinTotal: "",
      bilirubinDirect: "",
      alt: "",
      alp: "",
      bun: "",
      creatinine: "",
      sodium: "",
      potassium: "",
      chloride: "",
      vitaminD: "",
    },
    notes: "",
  });

  const printStyles = `
    @page { size: A4; margin: 10mm; }
    @media print {
      body { -webkit-print-color-adjust: exact; }
      .print-section { padding: 20px; font-family: Arial, sans-serif; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      .header { text-align: center; margin-bottom: 20px; }
      .section-title { font-weight: bold; margin: 15px 0 10px 0; }
    }
  `;

  const handlePrint = useReactToPrint({
    content: () => formRef.current,
    pageStyle: printStyles,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        if (patientId) {
          const patient = await patientService.getPatientById(patientId);
          setPatientData(patient);
        }

        if (existingReportId) {
          const report = await getBloodReportById(existingReportId);
          setFormData({
            ...report,
            sampleCollectedDate: format(
              new Date(report.sampleCollectedDate),
              "yyyy-MM-dd"
            ),
            sampleTestedDate: format(
              new Date(report.sampleTestedDate),
              "yyyy-MM-dd"
            ),
            hematology: report.hematology || {
              hb: "",
              pcv: "",
              tlc: "",
              neutrophils: "",
              eosinophils: "",
              basophils: "",
              monocytes: "",
              lymphocytes: "",
              rbc: "",
              platelets: "",
              mchc: "",
              mch: "",
              mcv: "",
            },
            clinicalChemistry: report.clinicalChemistry || {
              glucose: "",
              albumin: "",
              totalProtein: "",
              bilirubinTotal: "",
              bilirubinDirect: "",
              alt: "",
              alp: "",
              bun: "",
              creatinine: "",
              sodium: "",
              potassium: "",
              chloride: "",
              vitaminD: "",
            },
          });

          // Set the patientId from the report if not provided
          if (!patientId && report.patient) {
            // Make sure report.patient is a string ID, not an object
            const patientIdFromReport =
              typeof report.patient === "object"
                ? report.patient._id
                : report.patient;
            const patient = await patientService.getPatientById(
              patientIdFromReport
            );
            setPatientData(patient);
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId, existingReportId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("hematology.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        hematology: { ...prev.hematology, [field]: value },
      }));
    } else if (name.startsWith("clinicalChemistry.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        clinicalChemistry: { ...prev.clinicalChemistry, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!formData.veterinarian) {
        throw new Error("Veterinarian name is required");
      }

      // Get the patient ID correctly
      const patientIdToUse =
        patientId ||
        (formData.patient &&
          (typeof formData.patient === "object"
            ? formData.patient._id
            : formData.patient));

      const reportData = {
        veterinarian: formData.veterinarian,
        sampleCollectedDate: formData.sampleCollectedDate,
        sampleTestedDate: formData.sampleTestedDate,
        hematology: formData.hematology,
        clinicalChemistry: formData.clinicalChemistry,
        notes: formData.notes,
        patient: patientIdToUse,
      };

      // Convert empty strings to null for number fields
      Object.keys(reportData.hematology).forEach((key) => {
        if (reportData.hematology[key] === "") {
          reportData.hematology[key] = null;
        }
      });

      Object.keys(reportData.clinicalChemistry).forEach((key) => {
        if (reportData.clinicalChemistry[key] === "") {
          reportData.clinicalChemistry[key] = null;
        }
      });

      let result;
      if (existingReportId) {
        result = await updateBloodReport(existingReportId, reportData);
        setSuccess("Blood report updated successfully");
      } else {
        result = await createBloodReport(reportData);
        setSuccess("Blood report created successfully");
      }

      if (onSave) {
        onSave(result || reportData);
      } else {
        setTimeout(() => navigate(-1), 2000);
      }
    } catch (err) {
      setError(err.message || "Failed to save blood report");
    } finally {
      setLoading(false);
    }
  };
  // Data for Hematology fields to render the table
  // Update hematologyFields array to match backend exactly
  const hematologyFields = [
    {
      name: "hb",
      label: "Hb",
      unit: "gm/dL",
      dog: "12.4 - 19.1",
      cat: "9.8 – 15.4",
    },
    { name: "pcv", label: "PCV", unit: "%", dog: "35 - 57", cat: "30 - 45" },
    {
      name: "tlc",
      label: "TLC",
      unit: "1000/µL",
      dog: "6.0 - 17.0",
      cat: "5.5 - 19.5",
    },
    {
      name: "neutrophils",
      label: "Neutrophils",
      unit: "%",
      dog: "60 - 77",
      cat: "35 - 75",
    },
    {
      name: "eosinophils",
      label: "Eosinophils",
      unit: "%",
      dog: "2 - 10",
      cat: "0 - 12",
    },
    {
      name: "basophils",
      label: "Basophils",
      unit: "%",
      dog: "0 - 1",
      cat: "0 - 1",
    },
    {
      name: "monocytes",
      label: "Monocytes",
      unit: "%",
      dog: "3 - 10",
      cat: "0 - 4",
    },
    {
      name: "lymphocytes",
      label: "Lymphocytes",
      unit: "%",
      dog: "12 - 30",
      cat: "20 - 55",
    },
    {
      name: "rbc",
      label: "RBC",
      unit: "10^6/µL",
      dog: "5.5 - 8.5",
      cat: "5.0 - 10.0",
    },
    {
      name: "platelets",
      label: "Platelets",
      unit: "1000/µL",
      dog: "200 - 500",
      cat: "300 - 700",
    },
    { name: "mchc", label: "MCHC", unit: "%", dog: "32 - 36", cat: "30 - 36" },
    { name: "mch", label: "MCH", unit: "pg", dog: "19 - 24", cat: "13 - 17" },
    { name: "mcv", label: "MCV", unit: "fl", dog: "60 - 77", cat: "39 - 55" },
  ];

  // Update clinicalChemistryFields array to match backend exactly
  const clinicalChemistryFields = [
    {
      name: "glucose",
      label: "Glucose (RBS)",
      unit: "mg/dL",
      dog: "75 - 125",
      cat: "78 - 135",
    },
    {
      name: "albumin",
      label: "Albumin",
      unit: "gm/dL",
      dog: "2.7 - 4.4",
      cat: "2.5 - 3.9",
    },
    {
      name: "totalProtein",
      label: "Total Protein",
      unit: "gm/dL",
      dog: "5.2 - 7.2",
      cat: "5.7 - 8.9",
    },
    {
      name: "bilirubinTotal",
      label: "Bilirubin Total",
      unit: "mg/dL",
      dog: "0.1 - 0.6",
      cat: "0.1 - 0.7",
    },
    {
      name: "bilirubinDirect",
      label: "Bilirubin Direct",
      unit: "mg/dL",
      dog: "0.0 - 0.2",
      cat: "0.0 - 0.2",
    },
    {
      name: "alt",
      label: "ALT (SGPT)",
      unit: "IU/L",
      dog: "10 - 100",
      cat: "10 - 120",
    },
    {
      name: "alp",
      label: "ALP",
      unit: "IU/L",
      dog: "20 - 150",
      cat: "10 - 100",
    },
    { name: "bun", label: "BUN", unit: "mg/dL", dog: "7 - 27", cat: "14 - 36" },
    {
      name: "creatinine",
      label: "Creatinine",
      unit: "mg/dL",
      dog: "0.5 - 1.6",
      cat: "0.6 - 2.4",
    },
    {
      name: "sodium",
      label: "Sodium",
      unit: "mEq/l",
      dog: "140 - 155",
      cat: "147 - 156",
    },
    {
      name: "potassium",
      label: "Potassium",
      unit: "mEq/l",
      dog: "3.8 - 5.6",
      cat: "3.8 - 5.4",
    },
    {
      name: "chloride",
      label: "Chloride",
      unit: "mEq/l",
      dog: "105 - 120",
      cat: "112 - 129",
    },
    {
      name: "vitaminD",
      label: "Vitamin D",
      unit: "ng/ml",
      dog: "20 - 100",
      cat: "20 - 100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-orange-50 to-white">
            <h2 className="text-2xl font-semibold text-gray-900">
              {existingReportId
                ? "Edit Blood Report"
                : "Create New Blood Report"}
            </h2>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border-l-4 border-red-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                </div>
              </div>
            )}

            {patientData && (
              <div className="mb-6 p-4 rounded-lg bg-blue-50 border-l-4 border-blue-500">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    <svg
                      className="h-5 w-5 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">
                      Patient Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-700">
                      <div>
                        <span className="font-medium">Name:</span>{" "}
                        {patientData.name}
                      </div>
                      <div>
                        <span className="font-medium">Species:</span>{" "}
                        {patientData.species}
                      </div>
                      <div>
                        <span className="font-medium">Breed:</span>{" "}
                        {patientData.breed || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">ID:</span>{" "}
                        {patientData.petId || "N/A"}
                      </div>
                      <div>
                        <span className="font-medium">Reg:</span>{" "}
                        {patientData.registrationNumber}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div
              ref={formRef}
              className="print-section bg-white p-6 rounded-lg border border-gray-200"
            >
              <div className="header text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                  SRI VETERINARY CLINIC (SVC)
                </h1>
                <p className="text-gray-600 italic">"Where Hands Reach Paws"</p>
                <h2 className="text-xl font-semibold mt-2 text-gray-800">
                  BLOOD REPORT
                </h2>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Report Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Veterinarian *
                      </label>
                      <input
                        type="text"
                        name="veterinarian"
                        value={formData.veterinarian}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sample Collected Date *
                      </label>
                      <input
                        type="date"
                        name="sampleCollectedDate"
                        value={formData.sampleCollectedDate}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sample Tested Date *
                      </label>
                      <input
                        type="date"
                        name="sampleTestedDate"
                        value={formData.sampleTestedDate}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    HAEMATOLOGY REPORT
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Parameters
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Unit
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Values
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Dog
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Cat
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td
                            colSpan="5"
                            className="px-4 py-2 font-medium bg-gray-100"
                          >
                            Complete Blood Cell Count
                          </td>
                        </tr>
                        {hematologyFields.map((field) => (
                          <tr key={field.name}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {field.label}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {field.unit}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="number"
                                step="0.01"
                                name={`hematology.${field.name}`}
                                value={formData.hematology[field.name] || ""}
                                onChange={handleChange}
                                className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {field.dog}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {field.cat}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    CLINICAL CHEMISTRY
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Parameters
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Unit
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Values
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Dog
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Cat
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {clinicalChemistryFields.map((field) => (
                          <tr key={field.name}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {field.label}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {field.unit}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <input
                                type="number"
                                step="0.01"
                                name={`clinicalChemistry.${field.name}`}
                                value={
                                  formData.clinicalChemistry[field.name] || ""
                                }
                                onChange={handleChange}
                                className="w-full px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                              />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {field.dog}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {field.cat}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Notes
                  </h3>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                  />
                </div>

                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                  <div>
                    {!onCancel && (
                      <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Back
                      </button>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={handlePrint}
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50"
                    >
                      Print Report
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save Report"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BloodReportForm;
