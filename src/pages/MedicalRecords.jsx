import { useState, useEffect } from "react";
import MedicalRecordForm from "../components/MedicalRecordForm.jsx"; // Assuming MedicalRecordForm is in the same directory or correctly imported
import logo from "../assets/clinic.jpg"; // Assuming this path is correct for your project
import { CiBarcode } from "react-icons/ci";
import {
  FaPlus,
  FaChevronLeft,
  FaFileMedical,
  FaSearch,
  FaUser,
  FaCalendarAlt,
  FaPrint,
  FaEdit,
  FaTrash,
  FaUserMd,
} from "react-icons/fa";

import {
  getMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
} from "../api/medicalRecordService.js"; // Assuming this path is correct for your project
import { format, parseISO } from "date-fns"; // Import date-fns for formatting and parsing

const MedicalRecords = () => {
  const [showForm, setShowForm] = useState(false);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  // Removed activeTab state as there will only be one view
  const [recordToPrint, setRecordToPrint] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  // Load records from backend on mount
  useEffect(() => {
    fetchRecords();
  }, []);

  // Function to fetch medical records from the backend
  const fetchRecords = async () => {
    try {
      const response = await getMedicalRecords();
      setRecords(response.data);
    } catch (error) {
      console.error("Failed to fetch records:", error);
    }
  };

  // Function to handle printing a medical record
  const printRecord = (record) => {
    setRecordToPrint(record);
    // Set a timeout to ensure the record is rendered before printing
    setTimeout(() => {
      window.print();
      setRecordToPrint(null); // Clear the record after printing
    }, 100);
  };

  // Function to toggle the visibility of the medical record form
  const toggleForm = () => {
    setShowForm((prev) => !prev);
    if (showForm) setEditingRecord(null); // Clear editing record when closing the form
  };

  // Handler for submitting the form (add new or update existing record)
  const handleFormSubmit = async (formRecord) => {
    try {
      if (editingRecord) {
        // Update existing record
        await updateMedicalRecord(editingRecord._id, formRecord);
      } else {
        // Add new record
        await createMedicalRecord(formRecord);
      }
      await fetchRecords(); // Refresh records after submission
      setShowForm(false); // Hide the form
      setEditingRecord(null); // Clear editing state
    } catch (error) {
      console.error("Error saving record:", error);
    }
  };

  // Handler for deleting a medical record
  const handleDelete = async (_id) => {
    // Confirm deletion with the user
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteMedicalRecord(_id);
      // Update state to remove the deleted record
      setRecords((prev) => prev.filter((record) => record._id !== _id));
    } catch (error) {
      console.error("Failed to delete record:", error);
    }
  };

  // Handler for editing a medical record
  const handleEdit = (record) => {
    setEditingRecord(record); // Set the record to be edited
    setShowForm(true); // Show the form for editing
  };

  // Filter records based on search term
  const filteredRecords = records
    .filter((record) => {
      const patient = record.patient;
      // Ensure patient is an object (not null, not array)
      if (!patient || Array.isArray(patient)) return false;

      const nameMatch = patient.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const ownerMatch = patient.ownerName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const diagnosisMatch = record.diagnosis
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      return nameMatch || ownerMatch || diagnosisMatch;
    })
    // Removed the filter logic for activeTab as tabs are removed
    .sort((a, b) => {
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      return dateB.getTime() - dateA.getTime(); // Sort by date in descending order
    });

  // Helper function to format date for display
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return "";
    try {
      return format(parseISO(dateStr), "MMM dd,yyyy");
    } catch (e) {
      console.error("Error parsing date:", dateStr, e);
      return dateStr; // Return original string if parsing fails
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            {showForm && (
              <button
                onClick={toggleForm}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              >
                <FaChevronLeft className="text-gray-600 text-lg" />
              </button>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {showForm ? "Medical Record" : "Medical Records"}
            </h1>
          </div>

          {!showForm && (
            <button
              onClick={toggleForm}
              className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition text-lg"
            >
              <FaPlus className="text-xl" />
              <span>New Record</span>
            </button>
          )}
        </div>

        {!showForm && (
          <div className="mt-6 relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 text-xl" />
            </div>
            <input
              type="text"
              placeholder="Search by patient, owner or diagnosis..."
              className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </header>

      {/* Main Content Area: Form or Records List */}
      {showForm ? (
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <MedicalRecordForm
            record={editingRecord}
            onSubmit={handleFormSubmit}
            onCancel={toggleForm}
            setRecords={setRecords}
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Tabs - Now only "All Records" */}
          <div className="flex space-x-4 border-b border-gray-200">
            {/* Only "All Records" tab is rendered */}
            <button
              key="all"
              className={`px-6 py-3 font-medium text-lg flex items-center gap-3 relative text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-indigo-600`}
            >
              All Records
            </button>
          </div>

          {/* Records List */}
          <div className="grid grid-cols-1 gap-6">
            {filteredRecords.map((record) => (
              <div
                key={record._id}
                className={`bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 ${
                  record.status === "resolved"
                    ? "border-green-500"
                    : record.status === "critical"
                    ? "border-red-500"
                    : "border-blue-500"
                } transition-all hover:shadow-md`}
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                    <div className="space-y-4 flex-1">
                      <div className="flex flex-wrap items-center gap-4">
                        <h3 className="text-xl font-bold text-gray-800">
                          {record.patient.name}
                          <span className="text-gray-500 font-normal ml-2 text-base">
                            ({record.patient.species})
                          </span>
                        </h3>
                        {record.status === "critical" && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                            Critical Case
                          </span>
                        )}
                        {record.followUpDate && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                            Follow-up Needed
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoBlock
                          icon={<FaUser />}
                          label="Owner"
                          value={record.patient.ownerName}
                        />
                        <InfoBlock
                          icon={<FaCalendarAlt />}
                          label="Last Visit"
                          value={formatDateDisplay(record.date)}
                        />
                        <InfoBlock
                          icon={<FaUserMd />}
                          label="Veterinarian"
                          value={record.vetenarian}
                        />
                        <InfoBlock
                          icon={<CiBarcode />}
                          label="Pet Id/ Microchip No"
                          value={record.patient.petId}
                        />
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">
                          Diagnosis
                        </h4>
                        <p className="text-base text-gray-700">
                          {record.diagnosis || "No diagnosis recorded"}
                        </p>
                      </div>

                      {record.treatment && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-700 mb-2">
                            Treatment
                          </h4>
                          <p className="text-base text-gray-700">
                            {record.treatment}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => printRecord(record)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-base hover:bg-gray-200"
                        >
                          <FaPrint /> Print
                        </button>
                        <button
                          onClick={() => handleEdit(record)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-base hover:bg-blue-200"
                        >
                          <FaEdit /> Edit
                        </button>

                        <button
                          onClick={() => handleDelete(record._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-base hover:bg-red-200"
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>

                      {record.followUpDate && (
                        <div className="flex items-center gap-3 bg-yellow-50 text-yellow-800 px-4 py-3 rounded-xl">
                          <FaCalendarAlt className="text-xl" />
                          <span className="text-base font-medium">
                            Follow-up: {formatDateDisplay(record.followUpDate)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Medications Table */}
                  {record.medications?.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">
                        Prescribed Medications
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {[
                                "Medication",
                                "Dosage",
                                "Frequency",
                                "Duration",
                              ].map((head) => (
                                <th
                                  key={head}
                                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider"
                                >
                                  {head}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {record.medications.map((med, i) => (
                              <tr key={i}>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {med.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {med.dosage}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {med.frequency}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {med.duration}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredRecords.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <FaFileMedical className="mx-auto h-16 w-16 text-gray-300 mb-6" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No medical records found
              </h3>
              <p className="text-lg text-gray-500 mb-6">
                Create new records to see them here.
              </p>
              <button
                onClick={toggleForm}
                className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition text-lg"
              >
                <FaPlus />
                <span>Create Record</span>
              </button>
            </div>
          )}
        </div>
      )}
      {recordToPrint && (
        <div className="printable-record p-6 print:p-2">
          <style>
            {`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-record, .printable-record * {
            visibility: visible;
          }
          .printable-record {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%; /* Ensure it takes full width for printing */
            height: 100%; /* Ensure it takes full height for printing */
            box-sizing: border-box; /* Include padding in width/height */
          }
          @page {
            size: A4 portrait; /* Corrected 'potrait' to 'portrait' */
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }
        }
      `}
          </style>
          <div className="flex items-center justify-between mb-4">
            {/* Logo on the left */}
            <div className="flex-shrink-0">
              <img
                src={logo}
                alt="VetCare Clinic Logo"
                className="w-16 h-16 object-contain"
              />
            </div>

            {/* Clinic info on the right */}
            <div className="text-right ml-4">
              <h1 className="text-xl font-bold text-gray-800">
                Sri Veterinary Clinic
              </h1>
              <p className="text-gray-600 text-xs">
                Nursery Chowk, Dhungedhara
              </p>
              <p className="text-gray-600 text-xs">
                srivetclinic2022@gmail.com
              </p>
              <p className="text-gray-600 text-xs">
                Phone: +977 9849709736, 9808956106
              </p>
            </div>
          </div>

          <p>Date: {new Date().toLocaleDateString()}</p>

          <hr className="my-2" />
          <h2>
            Medical Record for {recordToPrint.patient.name} (
            {recordToPrint.patient.species})
          </h2>
          <table
            style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}
            border="1"
          >
            <tbody>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    padding: 8,
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  Owner
                </th>
                <td style={{ padding: 8 }}>
                  {recordToPrint.patient.ownerName}
                </td>
              </tr>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    padding: 8,
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  Pet Code:
                </th>
                <td style={{ padding: 8 }}>{recordToPrint.patient.petId}</td>
              </tr>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    padding: 8,
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  Last Visit
                </th>
                <td style={{ padding: 8 }}>
                  {formatDateDisplay(recordToPrint.date)}
                </td>
              </tr>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    padding: 8,
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  Veterinarian
                </th>
                <td style={{ padding: 8 }}>{recordToPrint.vetenarian}</td>
              </tr>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    padding: 8,
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  Diagnosis
                </th>
                <td style={{ padding: 8 }}>
                  {recordToPrint.diagnosis || "No diagnosis recorded"}
                </td>
              </tr>
              {recordToPrint.treatment && (
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 8,
                      backgroundColor: "#f3f4f6",
                    }}
                  >
                    Treatment
                  </th>
                  <td style={{ padding: 8 }}>{recordToPrint.treatment}</td>
                </tr>
              )}
              {recordToPrint.followUpDate && (
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: 8,
                      backgroundColor: "#f3f4f6",
                    }}
                  >
                    Follow-up Date
                  </th>
                  <td style={{ padding: 8 }}>
                    {formatDateDisplay(recordToPrint.followUpDate)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {recordToPrint.medications?.length > 0 && (
            <>
              <h3 style={{ marginTop: 30 }}>Prescribed Medications</h3>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginTop: 10,
                }}
                border="1"
              >
                <thead>
                  <tr>
                    {[
                      "Medication",
                      "Dosage",
                      "Frequency",
                      "Duration",
                      "Notes",
                    ].map((head) => (
                      <th
                        key={head}
                        style={{
                          textAlign: "left",
                          padding: 8,
                          backgroundColor: "#f3f4f6",
                        }}
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recordToPrint.medications.map((med, i) => (
                    <tr key={i}>
                      <td style={{ padding: 8 }}>{med.name}</td>
                      <td style={{ padding: 8 }}>{med.dosage}</td>
                      <td style={{ padding: 8 }}>{med.frequency}</td>
                      <td style={{ padding: 8 }}>{med.duration}</td>
                      <td style={{ padding: 8 }}>
                        {recordToPrint.notes || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: "60px", textAlign: "left" }}>
                <p style={{ fontWeight: "bold" }}>Doctor's Signature:</p>
                <div
                  style={{
                    borderBottom: "1px solid #000",
                    width: "250px",
                    height: "40px",
                    marginTop: "10px",
                  }}
                ></div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Reusable Info Block Component
const InfoBlock = ({ icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="p-3 rounded-full bg-indigo-50 text-indigo-600">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-base font-medium text-gray-800">{value}</p>
    </div>
  </div>
);

export default MedicalRecords;
