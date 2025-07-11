import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { medicalRecordService } from "../../api/medicalRecordService";
import { patientService } from "../../api/patientService";
import { BACKEND_URL } from "../../config";
import FileUploadComponent from "./FileUploadComponent";
import FileList from "./FileList";
import { AddMedicalRecord } from "./AddMedicalRecord";
import { PrintMedicalRecord } from "./PrintMedicalRecord";

const MedicalRecordView = () => {
  const { id } = useParams();
  const [record, setRecord] = useState(null);
  const [patient, setPatient] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false); // State to control print view

  const fetchMedicalRecord = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await medicalRecordService.getRecordById(id);
      const recordData = response.data || response;

      if (!recordData) {
        throw new Error("No data received");
      }

      setRecord(recordData);

      let patientData = null;
      if (recordData.patient && typeof recordData.patient === "object") {
        patientData = recordData.patient;
      } else if (recordData.patient) {
        const patientResponse = await patientService.getPatientById(
          recordData.patient
        );
        patientData = patientResponse.data || patientResponse;
      }
      setPatient(patientData || null);

      if (patientData && patientData.client) {
        setOwner(patientData.client);
        console.log(patientData.client);
      } else {
        setOwner({
          name: "N/A",
          phone: "N/A",
          address: "N/A",
          email: "N/A",
        });
      }

      setLoading(false);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load medical record"
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalRecord();
  }, [id]);

  const handleFileDownload = async (fileType, fileId, fileName) => {
    try {
      const response = await medicalRecordService.downloadFile(
        id,
        fileType,
        fileId
      );

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      setError(err.message || "Failed to download file");
    }
  };

  const handleFileDelete = async (fileType, fileId) => {
    try {
      await medicalRecordService.deleteFile(id, fileType, fileId);
      fetchMedicalRecord();
    } catch (err) {
      console.error("Delete error:", err);
      setError(err.message || "Failed to delete file");
    }
  };

  const handleSaveMedicalRecord = async (petId, formData) => {
    try {
      await medicalRecordService.updateRecord(id, formData);
      setIsEditing(false);
      fetchMedicalRecord();
    } catch (err) {
      console.error("Error saving medical record:", err);
      setError(err.message || "Failed to save medical record");
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg font-medium text-gray-700">
          Loading medical record...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-lg text-red-600 text-center border border-red-200">
          <p className="text-xl font-semibold mb-2">Error Loading Record</p>
          <p className="text-sm text-gray-700 mb-1">{error}</p>
          <p className="text-xs text-gray-500">Record ID: {id}</p>
        </div>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 bg-white rounded-lg shadow-lg text-gray-700 text-center border border-gray-200">
          <p className="text-xl font-semibold mb-2">Medical record not found</p>
          <p className="text-sm text-gray-500">Please check the record ID.</p>
        </div>
      </div>
    );
  }

  // Render PrintMedicalRecord component if isPrinting is true
  if (isPrinting) {
    return (
      <PrintMedicalRecord
        record={record}
        patient={patient}
        owner={owner}
        onBack={() => setIsPrinting(false)} // Function to go back from print view
      />
    );
  }

  if (isEditing) {
    return (
      <AddMedicalRecord
        petId={patient?._id}
        initialData={record}
        onSave={handleSaveMedicalRecord}
        onCancel={handleCancelEdit}
      />
    );
  }

  const Section = ({ title, children }) => (
    <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
        {title}
      </h2>
      {children}
    </div>
  );

  const DetailItem = ({ label, value }) => {
    if (!value) return null;
    return (
      <div className="flex flex-col">
        <p className="font-medium text-gray-600 text-sm">{label}:</p>
        <p className="text-gray-900 text-base font-semibold">{value}</p>
      </div>
    );
  };

  const ListItem = ({ children }) => (
    <li className="mb-1 text-gray-700 text-base">{children}</li>
  );

  return (
    <div className="min-h-screen bg-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl max-w-7xl mx-auto my-8 border border-gray-100">
        {/* Header */}
        <div className="border-b-2 border-gray-200 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end">
          <div>
            <h1 className="text-4xl font-extrabold text-orange-600 tracking-tight mb-2">
              Veterinary Medical Record
            </h1>
            <p className="text-lg text-gray-600 font-light">
              Record for{" "}
              <span className="font-medium text-gray-800">
                {patient?.name || "N/A"}
              </span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Date of Visit:{" "}
              <span className="font-medium">
                {record.date
                  ? format(new Date(record.date), "MMMM dd, yyyy - hh:mm a")
                  : "N/A"}
              </span>
            </p>
          </div>
          <div className="text-right mt-4 sm:mt-0">
            <p className="font-bold text-gray-800 text-xl">
              Dr. {record.veterinarian}
            </p>
            <p className="text-sm text-gray-600">Attending Veterinarian</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mb-8">
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 rounded-xl font-semibold text-base bg-orange-600 text-white hover:bg-orange-700 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
          >
            Edit Record
          </button>
          {/* New Print Button */}
          <button
            onClick={() => setIsPrinting(true)} // Set isPrinting to true to switch to print view
            className="px-6 py-3 rounded-xl font-semibold text-base bg-gray-800 text-white hover:bg-gray-900 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg"
          >
            Print Record
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`py-3 px-6 text-lg font-medium ${
              activeTab === "overview"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-600 hover:text-gray-800"
            } transition-colors duration-200`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`py-3 px-6 text-lg font-medium ${
              activeTab === "clinical"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-600 hover:text-gray-800"
            } transition-colors duration-200`}
            onClick={() => setActiveTab("clinical")}
          >
            Clinical Details
          </button>
          <button
            className={`py-3 px-6 text-lg font-medium ${
              activeTab === "attachments"
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-600 hover:text-gray-800"
            } transition-colors duration-200`}
            onClick={() => setActiveTab("attachments")}
          >
            Attachments
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Patient Information */}
            <Section title="Patient Information">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailItem label="Name" value={patient?.name} />
                <DetailItem label="Species" value={patient?.species} />
                <DetailItem label="Breed" value={patient?.breed} />
                <DetailItem label="Age" value={patient?.age} />
                <DetailItem label="Sex" value={patient?.gender} />
                <DetailItem label="Weight" value={`${record.weight} kg`} />
              </div>
            </Section>

            {/* Client (Owner) Information */}
            <Section title="Client (Owner) Information">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <DetailItem label="Owner Name" value={owner?.owner || "N/A"} />
                <DetailItem label="Phone" value={owner?.contact || "N/A"} />
                <DetailItem label="Email" value={owner?.email || "N/A"} />
                <DetailItem label="Address" value={owner?.address || "N/A"} />
              </div>
            </Section>

            {/* Reason for Visit */}
            {record.reason && (
              <Section title="Reason for Visit">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {record.reason}
                </p>
              </Section>
            )}

            {/* Diagnosis */}
            {record.diagnosis?.length > 0 && (
              <Section title="Diagnosis">
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  {record.diagnosis.map((item, index) => (
                    <ListItem key={index}>{item}</ListItem>
                  ))}
                </ul>
              </Section>
            )}

            {/* Treatment Plan */}
            {record.treatmentPlan?.length > 0 && (
              <Section title="Treatment Plan">
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  {record.treatmentPlan.map((item, index) => (
                    <ListItem key={index}>{item}</ListItem>
                  ))}
                </ul>
              </Section>
            )}

            {/* Medications */}
            {record.medications?.length > 0 && (
              <Section title="Medications Prescribed">
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Medication
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Dosage
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Frequency
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                          Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {record.medications.map((med, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {med.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {med.dosage}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {med.frequency}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {med.duration}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {med.quantity}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            )}

            {/* Vaccination Status */}
            {record.vaccinationStatus && (
              <Section title="Vaccination Status">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-base text-gray-700">
                  {Object.entries(record.vaccinationStatus).map(
                    ([vaccine, status]) => (
                      <div
                        key={vaccine}
                        className="flex items-center p-2 bg-gray-50 rounded-lg border border-gray-200 shadow-sm"
                      >
                        <span
                          className={`inline-block w-4 h-4 rounded-full mr-3 ${
                            status ? "bg-green-500" : "bg-red-500"
                          } flex-shrink-0`}
                        ></span>
                        <span className="capitalize font-medium">
                          {vaccine}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </Section>
            )}

            {/* Notes */}
            {record.notes && (
              <Section title="Notes">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {record.notes}
                </p>
              </Section>
            )}

            {/* Conclusion */}
            {record.conclusion && (
              <Section title="Conclusion">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {record.conclusion}
                </p>
              </Section>
            )}

            {/* Prognosis */}
            {record.progonosis && (
              <Section title="Prognosis">
                <p className="text-gray-700">{record.progonosis}</p>
              </Section>
            )}

            {/* Advice */}
            {record.advice && (
              <Section title="Care Advice">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {record.advice}
                </p>
              </Section>
            )}

            {/* Follow-up */}
            {record.followUpDate && (
              <Section title="Follow-up">
                <p className="text-gray-700">
                  Follow-up scheduled for:{" "}
                  <span className="font-semibold text-orange-600">
                    {format(new Date(record.followUpDate), "MMMM dd, yyyy")}
                  </span>
                </p>
              </Section>
            )}
          </div>
        )}

        {activeTab === "clinical" && (
          <div className="space-y-8">
            {/* Clinical Examination */}
            {(record.clinicalExamination || record.examination?.length > 0) && (
              <Section title="Clinical Examination">
                {record.clinicalExamination && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <DetailItem
                      label="Temperature"
                      value={
                        record.clinicalExamination.temperature
                          ? `${record.clinicalExamination.temperature} °C`
                          : null
                      }
                    />
                    <DetailItem
                      label="Pulse"
                      value={
                        record.clinicalExamination.pulse
                          ? `${record.clinicalExamination.pulse} bpm`
                          : null
                      }
                    />
                    <DetailItem
                      label="Respiration"
                      value={
                        record.clinicalExamination.respiration
                          ? `${record.clinicalExamination.respiration} breaths/min`
                          : null
                      }
                    />
                    <DetailItem
                      label="Weight"
                      value={
                        record.clinicalExamination.weight
                          ? `${record.clinicalExamination.weight} kg`
                          : null
                      }
                    />
                    <DetailItem
                      label="Body Condition Score"
                      value={
                        record.clinicalExamination.bodyConditionScore
                          ? `${record.clinicalExamination.bodyConditionScore}/9`
                          : null
                      }
                    />
                    <DetailItem
                      label="Hydration Status"
                      value={record.clinicalExamination.hydrationStatus}
                    />
                    <DetailItem
                      label="CRT"
                      value={
                        record.clinicalExamination.capillaryRefillTime
                          ? `${record.clinicalExamination.capillaryRefillTime} sec`
                          : null
                      }
                    />
                    <DetailItem
                      label="Mucous Membranes"
                      value={record.clinicalExamination.mucousMembranes}
                    />
                    <DetailItem
                      label="Skin"
                      value={record.clinicalExamination.skin}
                    />
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                      <DetailItem
                        label="Other Findings"
                        value={record.clinicalExamination.otherFindings}
                      />
                    </div>
                  </div>
                )}

                {record.examination?.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">
                      Detailed Examination Findings:
                    </h3>
                    <ul className="list-disc pl-5 text-gray-700 space-y-1">
                      {record.examination.map((item, index) => (
                        <ListItem key={index}>{item}</ListItem>
                      ))}
                    </ul>
                  </div>
                )}
              </Section>
            )}

            {/* Clinical Signs */}
            {record.clinicalSigns?.length > 0 && (
              <Section title="Clinical Signs">
                <ul className="list-disc pl-5 text-gray-700 space-y-1">
                  {record.clinicalSigns.map((sign, index) => (
                    <ListItem key={index}>{sign}</ListItem>
                  ))}
                </ul>
              </Section>
            )}
          </div>
        )}

        {activeTab === "attachments" && (
          <div className="space-y-8">
            {/* File Upload Section */}
            <Section title="Upload New Attachments">
              <FileUploadComponent
                recordId={id}
                recordData={record}
                refreshRecord={fetchMedicalRecord}
                onDownload={handleFileDownload}
                onDeleteFile={handleFileDelete}
              />
            </Section>

            {/* Display existing files */}
            {(record.consentForms?.length > 0 ||
              record.medicalReportFiles?.length > 0 ||
              record.surgeryReportFiles?.length > 0 ||
              record.vaccinationReportFiles?.length > 0) && (
              <Section title="Existing Attachments">
                {record.consentForms?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Consent Forms
                    </h3>
                    <FileList
                      files={record.consentForms}
                      recordId={id}
                      fileType="consentForms"
                      onDelete={fetchMedicalRecord}
                      onDownload={handleFileDownload}
                      onDeleteFile={handleFileDelete}
                    />
                  </div>
                )}

                {record.medicalReportFiles?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Medical Reports
                    </h3>
                    <FileList
                      files={record.medicalReportFiles}
                      recordId={id}
                      fileType="medicalReportFiles"
                      onDelete={fetchMedicalRecord}
                      onDownload={handleFileDownload}
                      onDeleteFile={handleFileDelete}
                    />
                  </div>
                )}

                {record.surgeryReportFiles?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Surgery Reports
                    </h3>
                    <FileList
                      files={record.surgeryReportFiles}
                      recordId={id}
                      fileType="surgeryReportFiles"
                      onDelete={fetchMedicalRecord}
                      onDownload={handleFileDownload}
                      onDeleteFile={handleFileDelete}
                    />
                  </div>
                )}

                {record.vaccinationReportFiles?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Vaccination Reports
                    </h3>
                    <FileList
                      files={record.vaccinationReportFiles}
                      recordId={id}
                      fileType="vaccinationReportFiles"
                      onDelete={fetchMedicalRecord}
                      onDownload={handleFileDownload}
                      onDeleteFile={handleFileDelete}
                    />
                  </div>
                )}
              </Section>
            )}
          </div>
        )}

        {/* Action Button for Treatment Status */}
        <div className="flex justify-end mt-4">
          <button
            onClick={async () => {
              try {
                await medicalRecordService.toggleTreatmentStatus(id);
                await fetchMedicalRecord(); // Refresh the record
              } catch (err) {
                setError(err.message || "Failed to update treatment status");
              }
            }}
            className={`px-6 py-3 rounded-xl font-semibold text-base ${
              record.treatmentCompleted
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "bg-gray-800 text-white hover:bg-gray-900"
            } transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg`}
          >
            Mark as {record.treatmentCompleted ? "Ongoing" : "Completed"}
          </button>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 pt-6 mt-8 flex flex-col sm:flex-row justify-between items-center text-gray-600 text-sm">
          <div className="mb-4 sm:mb-0">
            <p className="font-semibold text-gray-800">Treatment Status:</p>
            <p
              className={`text-lg font-bold ${
                record.treatmentCompleted ? "text-green-600" : "text-orange-600"
              }`}
            >
              {record.treatmentCompleted ? "Completed" : "Ongoing"}
            </p>
          </div>
          <div className="text-center sm:text-right">
            <p>
              Record created:{" "}
              <span className="font-medium text-gray-800">
                {record.createdAt
                  ? format(
                      new Date(record.createdAt),
                      "MMMM dd, yyyy - hh:mm a"
                    )
                  : "N/A"}
              </span>
            </p>
            {record.updatedAt && (
              <p className="mt-1">
                Last updated:{" "}
                <span className="font-medium text-gray-800">
                  {format(
                    new Date(record.updatedAt),
                    "MMMM dd, yyyy - hh:mm a"
                  )}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordView;
