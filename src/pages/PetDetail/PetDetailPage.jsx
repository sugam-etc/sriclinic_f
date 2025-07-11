import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { patientService } from "../../api/patientService";
import { BasicPetInfo } from "./BasicPetInfo";
import { MedicalHistorySection } from "./MedicalHistory";
import { AddMedicalRecord } from "../../components/medicalRecords/AddMedicalRecord";
import { medicalRecordService } from "../../api/medicalRecordService";
import { PetForm } from "./PetForm";
import { createBloodReport } from "../../api/bloodReportService";
import { surgeryService } from "../../api/surgeryService";
import { vaccinationService } from "../../api/vaccinationService";
import AddBloodReport from "./Forms/AddBloodReport";
import VaccinationForm from "../../components/VaccinationForm";
import { AddSurgery } from "./Forms/AddSurgery";
import * as ReactDOMClient from "react-dom/client"; // Import ReactDOMClient for React 18
import { AttachmentsSection } from "./Attachments/Attachments";
// Tab component for navigation
const Tab = ({ active, onClick, children }) => (
  <button
    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors duration-200 ${
      active
        ? "bg-white text-orange-600 border-t border-l border-r border-gray-200"
        : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

// Consent form components
const BaseConsentForm = ({ title, content, petData, children }) => {
  return (
    <div className="bg-white p-8 max-w-4xl mx-auto font-sans text-gray-900">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">SRI VETERINARY CLINIC</h1>
        <p className="text-gray-700">123 Animal Care Drive, Pet City</p>
        <p className="text-gray-700">Phone: (555) 123-4567</p>
      </div>

      <h2 className="text-xl font-bold text-center mb-6 underline">{title}</h2>

      <div className="mb-8">{content}</div>

      {/* Modified this div to always be a 2-column grid */}
      <div className="mt-12 grid grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold mb-2">Patient Information</h3>
          <p>Name: {petData.name}</p>
          <p>Species: {petData.species}</p>
          <p>Breed: {petData.breed}</p>
          <p>Age: {petData.age}</p>
        </div>
        <div>
          <h3 className="font-bold mb-2">Client Information</h3>
          <p>Name: {petData.owner?.owner}</p>
          <p>Contact: {petData.owner?.contact}</p>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="mb-1">Client Signature:</p>
            <div className="h-16 border-b border-gray-400"></div>
          </div>
          <div>
            <p className="mb-1">Date:</p>
            <p>{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
};

const AdmissionConsentForm = ({ petData }) => {
  const content = (
    <>
      <p className="mb-4">
        I, <strong>{petData.owner?.owner || "the owner"}</strong>, hereby
        authorize the veterinarians and staff of SRI Veterinary Clinic to
        perform diagnostic, therapeutic, and surgical procedures as deemed
        necessary for the medical care of my pet,{" "}
        <strong>{petData.name}</strong>.
      </p>
      <p className="mb-4">
        I understand that during the course of treatment, unforeseen conditions
        may be revealed that require additional procedures. I authorize such
        procedures to be performed.
      </p>
      <p className="mb-4">
        I understand that while all precautions will be taken to ensure the
        safety of my pet, there are inherent risks with any procedure, including
        anesthesia.
      </p>
      <p className="mb-4">
        I agree to pay for all services rendered at the time of discharge unless
        prior arrangements have been made.
      </p>
    </>
  );

  return (
    <BaseConsentForm
      title="ADMISSION AND TREATMENT CONSENT FORM"
      content={content}
      petData={petData}
    />
  );
};

const SurgeryConsentForm = ({ petData }) => {
  const content = (
    <>
      <p className="mb-4">
        I, <strong>{petData.owner?.owner || "the owner"}</strong>, hereby
        authorize the veterinarians of SRI Veterinary Clinic to perform surgical
        procedures on my pet, <strong>{petData.name}</strong>.
      </p>
      <p className="mb-4">
        I understand that anesthesia and surgery involve some risk to my pet. I
        have been informed of the nature of the procedure and the associated
        risks.
      </p>
      <p className="mb-4">
        I understand that while all precautions will be taken to ensure the
        safety of my pet, complications can occur including, but not limited to:
        adverse drug reactions, infection, bleeding, and in rare cases, death.
      </p>
      <p className="mb-4">
        I agree to pay for all surgical and associated medical costs at the time
        of discharge.
      </p>
    </>
  );

  return (
    <BaseConsentForm
      title="SURGERY CONSENT FORM"
      content={content}
      petData={petData}
    />
  );
};

const VaccinationConsentForm = ({ petData }) => {
  const content = (
    <>
      <p className="mb-4">
        I, <strong>{petData.owner?.owner || "the owner"}</strong>, hereby
        authorize the veterinarians of SRI Veterinary Clinic to administer
        vaccinations to my pet, <strong>{petData.name}</strong>.
      </p>
      <p className="mb-4">
        I understand that while vaccinations are generally safe, there is a
        small risk of adverse reactions including but not limited to: mild
        fever, lethargy, reduced appetite, swelling at the injection site, or in
        rare cases, allergic reactions.
      </p>
      <p className="mb-4">
        I have been informed about the benefits and risks of vaccination and
        choose to proceed with the recommended vaccination protocol.
      </p>
      <p className="mb-4">
        I understand that some vaccinations may require boosters and I am
        responsible for scheduling follow-up appointments as recommended.
      </p>
    </>
  );

  return (
    <BaseConsentForm
      title="VACCINATION CONSENT FORM"
      content={content}
      petData={petData}
    />
  );
};

const EuthanasiaConsentForm = ({ petData }) => {
  const content = (
    <>
      <p className="mb-4">
        I, <strong>{petData.owner?.owner || "the owner"}</strong>, hereby
        authorize the veterinarians of SRI Veterinary Clinic to perform
        euthanasia on my pet, <strong>{petData.name}</strong>.
      </p>
      <p className="mb-4">
        I understand that euthanasia is a humane procedure to end suffering and
        that it will result in the painless death of my pet.
      </p>
      <p className="mb-4">
        I have considered all other options and have made this decision after
        careful consideration and consultation with the veterinarian.
      </p>
      <p className="mb-4">
        I understand that I may be present during the procedure if I choose to
        be, and that I will need to make arrangements for the remains of my pet.
      </p>
    </>
  );

  return (
    <BaseConsentForm
      title="EUTHANASIA CONSENT FORM"
      content={content}
      petData={petData}
    />
  );
};

// Main PetDetailPage component
export const PetDetailPage = () => {
  const { patientId } = useParams();

  const [petData, setPetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const [isAddingBloodReport, setIsAddingBloodReport] = useState(false);
  const [isAddingSurgery, setIsAddingSurgery] = useState(false);
  const [isAddingVaccination, setIsAddingVaccination] = useState(false);
  const [activeTab, setActiveTab] = useState("medical");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isConsentDropdownOpen, setIsConsentDropdownOpen] = useState(false);
  const [activeConsentForm, setActiveConsentForm] = useState(null);

  const dropdownRef = useRef(null);
  const consentRef = useRef(null);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
    if (consentRef.current && !consentRef.current.contains(event.target)) {
      setIsConsentDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchPetData = async () => {
    try {
      setLoading(true);
      const response = await patientService.getPatientById(patientId);
      if (response) {
        setPetData({
          ...response,
          medicalHistory: response.medicalHistory || [],
          bloodReports: response.bloodReports || [],
          surgeryHistory: response.surgeryHistory || [],
          vaccinationHistory: response.vaccinationHistory || [],
          attachments: response.attachments || [], // Add this line
          owner: response.client || {},
        });
      } else {
        setError("Received empty data from server");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch pet data";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId) {
      fetchPetData();
    } else {
      setError("No patient ID provided");
      setLoading(false);
    }
  }, [patientId]);

  const handleSaveRecord = async (petId, formData) => {
    try {
      setLoading(true);
      const response = await medicalRecordService.createMedicalRecord(formData);

      if (response) {
        setIsAddingRecord(false);
        setIsDropdownOpen(false);
        await fetchPetData();
      }
    } catch (err) {
      setError(err.message || "Failed to save medical record");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBloodReport = async (formData) => {
    try {
      setLoading(true);
      const result = await createBloodReport({
        ...formData,
        patient: patientId,
      });

      setIsAddingBloodReport(false);
      setIsDropdownOpen(false);
      await fetchPetData();
      // window.reload(); // Removed as it causes full page reload and loses state
    } catch (err) {
      setError(err.message || "Failed to save blood report");
      // window.reload(); // Removed as it causes full page reload and loses state
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSurgery = async (formData) => {
    try {
      setLoading(true);
      const response = await surgeryService.createSurgery({
        ...formData,
        patient: patientId,
      });

      if (response) {
        setIsAddingSurgery(false);
        setIsDropdownOpen(false);
        await fetchPetData();
      }
    } catch (err) {
      setError(err.message || "Failed to save surgery");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVaccination = async (formData) => {
    try {
      setLoading(true);
      const dataToSend = {
        ...formData,
        patient: patientId,
      };

      const response = await vaccinationService.createVaccination(dataToSend);

      if (response) {
        setIsAddingVaccination(false);
        setIsDropdownOpen(false);
        await fetchPetData();
      }
    } catch (err) {
      setError(err.message || "Failed to save vaccination");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePet = async (formData) => {
    try {
      setLoading(true);
      const response = await patientService.updatePatient(patientId, formData);
      if (response) {
        setIsEditing(false);
        await fetchPetData();
      }
    } catch (err) {
      setError(err.message || "Failed to update pet data");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (recordId, newStatus) => {
    try {
      setLoading(true);
      await medicalRecordService.toggleTreatmentStatus(recordId);
      await fetchPetData();
    } catch (err) {
      setError(err.message || "Failed to update treatment status");
    } finally {
      setLoading(false);
    }
  };

  const handlePrintConsent = (formComponent) => {
    const printWindow = window.open("", "", "width=800,height=600");
    if (!printWindow) {
      console.error("Failed to open print window. Pop-ups might be blocked.");
      return;
    }

    // Write the basic HTML structure to the new window
    printWindow.document.write(`
      <html>
        <head>
          <title>Consent Form</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
          <style>
            @media print {
              body { -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div id="print-content"></div>
          <script>
            // This script will run in the new window
            window.onload = function() {
              // Give a small delay to ensure React content is rendered before printing
              setTimeout(function() {
                window.print();
                window.close();
              }, 500); // Increased delay slightly for better rendering
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close(); // Important to close the document after writing

    const printContent = printWindow.document.getElementById("print-content");

    // Use createRoot and render for React 18 compatibility
    if (printContent) {
      const root = ReactDOMClient.createRoot(printContent);
      root.render(formComponent);
    } else {
      console.error("Print content element not found in the new window.");
    }
  };

  const renderTabContent = () => {
    if (!petData) return null;

    switch (activeTab) {
      case "medical":
        return (
          <MedicalHistorySection
            records={[...(petData.medicalHistory || [])].sort(
              (a, b) => new Date(b.date) - new Date(a.date)
            )}
            type="medical"
            onStatusToggle={handleStatusToggle}
          />
        );
      case "blood":
        return (
          <MedicalHistorySection
            records={[...(petData.bloodReports || [])].sort(
              (a, b) =>
                new Date(b.sampleCollectedDate) -
                new Date(a.sampleCollectedDate)
            )}
            type="blood"
          />
        );
      case "surgery":
        return (
          <MedicalHistorySection
            records={[...(petData.surgeryHistory || [])].sort(
              (a, b) => new Date(b.surgeryDate) - new Date(a.surgeryDate)
            )}
            type="surgery"
          />
        );
      case "vaccination":
        return (
          <MedicalHistorySection
            records={[...(petData.vaccinationHistory || [])].sort(
              (a, b) =>
                new Date(b.dateAdministered) - new Date(a.dateAdministered)
            )}
            type="vaccination"
          />
        );
      case "attachments":
        return (
          <AttachmentsSection
            attachments={petData.attachments || []}
            patientId={patientId}
            onUpdate={fetchPetData}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md">
          <p className="font-semibold mb-2">Error loading data:</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!petData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-600">
          No pet data found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Pet Medical Record
            </h1>
            <p className="text-gray-600 text-base mt-1">
              Comprehensive health history and details for {petData.name}
            </p>
          </div>

          {!isEditing &&
            !isAddingRecord &&
            !isAddingBloodReport &&
            !isAddingSurgery &&
            !isAddingVaccination && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 text-sm font-medium shadow-md flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  Edit Pet
                </button>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="px-5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200 text-sm font-medium shadow-md flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Add Record
                    <svg
                      className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div
                    className={`absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ${
                      isDropdownOpen ? "block" : "hidden"
                    } z-10`}
                  >
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingRecord(true);
                          setIsDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Medical Record
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingBloodReport(true);
                          setIsDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Blood Report
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingSurgery(true);
                          setIsDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Surgery
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingVaccination(true);
                          setIsDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Vaccination
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative" ref={consentRef}>
                  <button
                    onClick={() =>
                      setIsConsentDropdownOpen(!isConsentDropdownOpen)
                    }
                    className="px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 text-sm font-medium shadow-md flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Consent Forms
                    <svg
                      className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                        isConsentDropdownOpen ? "rotate-180" : ""
                      }`}
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <div
                    className={`absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ${
                      isConsentDropdownOpen ? "block" : "hidden"
                    } z-10`}
                  >
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          handlePrintConsent(
                            <AdmissionConsentForm petData={petData} />
                          );
                          setIsConsentDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admission Consent
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handlePrintConsent(
                            <SurgeryConsentForm petData={petData} />
                          );
                          setIsConsentDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Surgery Consent
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handlePrintConsent(
                            <VaccinationConsentForm petData={petData} />
                          );
                          setIsConsentDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Vaccination Consent
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handlePrintConsent(
                            <EuthanasiaConsentForm petData={petData} />
                          );
                          setIsConsentDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Euthanasia Consent
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>

        {isAddingRecord ? (
          <AddMedicalRecord
            petId={patientId}
            onSave={handleSaveRecord}
            onCancel={() => setIsAddingRecord(false)}
          />
        ) : isAddingBloodReport ? (
          <AddBloodReport
            patientId={patientId}
            onSave={handleSaveBloodReport}
            onCancel={() => setIsAddingBloodReport(false)}
          />
        ) : isAddingSurgery ? (
          <AddSurgery
            patientId={patientId}
            onSave={handleSaveSurgery}
            onCancel={() => setIsAddingSurgery(false)}
          />
        ) : isAddingVaccination ? (
          <VaccinationForm
            patientId={patientId}
            onSave={handleSaveVaccination}
            onCancel={() => setIsAddingVaccination(false)}
          />
        ) : isEditing ? (
          <PetForm
            initialData={petData}
            onSave={handleUpdatePet}
            onCancel={() => setIsEditing(false)}
            isEditing={true}
          />
        ) : (
          <div className="space-y-6">
            <BasicPetInfo petData={petData} />

            <div className="border-b border-gray-200">
              <nav className="flex space-x-1">
                <Tab
                  active={activeTab === "medical"}
                  onClick={() => setActiveTab("medical")}
                >
                  Medical Records
                </Tab>
                <Tab
                  active={activeTab === "blood"}
                  onClick={() => setActiveTab("blood")}
                >
                  Blood Reports
                </Tab>
                <Tab
                  active={activeTab === "surgery"}
                  onClick={() => setActiveTab("surgery")}
                >
                  Surgeries
                </Tab>
                <Tab
                  active={activeTab === "vaccination"}
                  onClick={() => setActiveTab("vaccination")}
                >
                  Vaccinations
                </Tab>
                <Tab
                  active={activeTab === "attachments"}
                  onClick={() => setActiveTab("attachments")}
                >
                  Attachments
                </Tab>
              </nav>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              {renderTabContent()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
