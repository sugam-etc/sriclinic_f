import { useState } from "react";
import MedicalRecordForm from "../components/MedicalRecordForm";
import logo from "../assets/clinic.jpg";
import {
  FaPlus,
  FaChevronLeft,
  FaFileMedical,
  FaSearch,
  FaUser,
  FaPaw,
  FaCalendarAlt,
  FaNotesMedical,
  FaPrescriptionBottleAlt,
  FaTrash,
  FaEdit,
  FaPrint,
  FaUserMd, // Fixed missing icon
} from "react-icons/fa";

import {
  getMedicalRecords,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
} from "../api/medicalRecordService.js";
import { useEffect } from "react";
import { format, parseISO } from "date-fns"; // Import date-fns for formatting and parsing

const MedicalRecords = () => {
  const [showForm, setShowForm] = useState(false);
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [recordToPrint, setRecordToPrint] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);

  // Load records from backend on mount
  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await getMedicalRecords();
      setRecords(response.data);
    } catch (error) {
      console.error("Failed to fetch records:", error);
    }
  };

  const printRecord = (record) => {
    setRecordToPrint(record);
    setTimeout(() => {
      window.print();
      setRecordToPrint(null);
    }, 100);
  };

  const toggleForm = () => {
    setShowForm((prev) => !prev);
    if (showForm) setEditingRecord(null);
  };

  // Add new or update existing record handler from form submission
  const handleFormSubmit = async (formRecord) => {
    try {
      if (editingRecord) {
        // Update record
        await updateMedicalRecord(editingRecord._id, formRecord);
      } else {
        // Add new record
        await createMedicalRecord(formRecord);
      }
      await fetchRecords();
      setShowForm(false);
      setEditingRecord(null);
    } catch (error) {
      console.error("Error saving record:", error);
    }
  };

  const handleDelete = async (_id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteMedicalRecord(_id);
      setRecords((prev) => prev.filter((record) => record._id !== _id));
    } catch (error) {
      console.error("Failed to delete record:", error);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const filteredRecords = records
    .filter(
      (record) =>
        record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((record) => {
      if (activeTab === "active") return record.status === "active";
      if (activeTab === "followup") return record.followUpDate;
      return true;
    })
    .sort((a, b) => {
      // Sort by date in descending order (latest first)
      const dateA = parseISO(a.date);
      const dateB = parseISO(b.date);
      return dateB.getTime() - dateA.getTime();
    });

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
      {/* Header */}
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
              {" "}
              {/* Adjusted font size */}
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
          {/* Tabs */}
          <div className="flex space-x-4 border-b border-gray-200">
            {["all", "active", "followup"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-lg flex items-center gap-3 relative ${
                  /* Adjusted font size */
                  activeTab === tab
                    ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-indigo-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "all"
                  ? "All Records"
                  : tab === "active"
                  ? "Active Cases"
                  : "Follow-ups Needed"}
              </button>
            ))}
          </div>

          {/* Records */}
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
                          {" "}
                          {/* Adjusted font size */}
                          {record.patientName}
                          <span className="text-gray-500 font-normal ml-2 text-base">
                            {" "}
                            {/* Kept as base for consistency */}(
                            {record.patientType})
                          </span>
                        </h3>
                        {record.status === "critical" && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                            {" "}
                            {/* Adjusted font size */}
                            Critical Case
                          </span>
                        )}
                        {record.followUpDate && (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                            {" "}
                            {/* Adjusted font size */}
                            Follow-up Needed
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <InfoBlock
                          icon={<FaUser />}
                          label="Owner"
                          value={record.ownerName}
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
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">
                          {" "}
                          {/* Adjusted font size */}
                          Diagnosis
                        </h4>
                        <p className="text-base text-gray-700">
                          {" "}
                          {/* Adjusted font size */}
                          {record.diagnosis || "No diagnosis recorded"}
                        </p>
                      </div>

                      {record.treatment && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-700 mb-2">
                            {" "}
                            {/* Adjusted font size */}
                            Treatment
                          </h4>
                          <p className="text-base text-gray-700">
                            {" "}
                            {/* Adjusted font size */}
                            {record.treatment}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => printRecord(record)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-base hover:bg-gray-200" /* Adjusted font size */
                        >
                          <FaPrint /> Print
                        </button>
                        <button
                          onClick={() => handleEdit(record)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-base hover:bg-blue-200" /* Adjusted font size */
                        >
                          <FaEdit /> Edit
                        </button>

                        <button
                          onClick={() => handleDelete(record._id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-base hover:bg-red-200" /* Adjusted font size */
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>

                      {record.followUpDate && (
                        <div className="flex items-center gap-3 bg-yellow-50 text-yellow-800 px-4 py-3 rounded-xl">
                          <FaCalendarAlt className="text-xl" />
                          <span className="text-base font-medium">
                            {" "}
                            {/* Adjusted font size */}
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
                        {" "}
                        {/* Adjusted font size */}
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
                                "Notes",
                              ].map((head) => (
                                <th
                                  key={head}
                                  className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider" /* Adjusted font size */
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
                                  {" "}
                                  {/* Adjusted font size */}
                                  {med.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {" "}
                                  {/* Adjusted font size */}
                                  {med.dosage}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {" "}
                                  {/* Adjusted font size */}
                                  {med.frequency}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {" "}
                                  {/* Adjusted font size */}
                                  {med.duration}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  {" "}
                                  {/* Adjusted font size */}
                                  {med.notes || "-"}
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
                {" "}
                {/* Adjusted font size */}
                No medical records found
              </h3>
              <p className="text-lg text-gray-500 mb-6">
                {" "}
                {/* Adjusted font size */}
                {activeTab === "all"
                  ? "Create new records to see them here."
                  : activeTab === "active"
                  ? "No active cases found."
                  : "No follow-ups needed."}
              </p>
              <button
                onClick={toggleForm}
                className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition text-lg" /* Adjusted font size */
              >
                <FaPlus />
                <span>Create Record</span>
              </button>
            </div>
          )}
        </div>
      )}
      {recordToPrint && (
        <div className="printable-record p-6" style={{ padding: 20 }}>
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
                VetCare Clinic
              </h1>
              <p className="text-gray-600 text-xs">123 Veterinary Street</p>
              <p className="text-gray-600 text-xs">Animal City, AC 12345</p>
              <p className="text-gray-600 text-xs">Phone: (123) 456-7890</p>
            </div>
          </div>

          <p>Date: {new Date().toLocaleDateString()}</p>

          <hr className="my-2" />
          <h2>
            Medical Record for {recordToPrint.patientName} (
            {recordToPrint.patientType})
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
                <td style={{ padding: 8 }}>{recordToPrint.ownerName}</td>
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
                      <td style={{ padding: 8 }}>{med.notes || "-"}</td>
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
      <p className="text-base font-medium text-gray-800">{value}</p>{" "}
      {/* Adjusted font size */}
    </div>
  </div>
);

export default MedicalRecords;
