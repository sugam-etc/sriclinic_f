import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { medicalRecordService } from "../../api/medicalRecordService";

export const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const MedicalHistorySection = ({ records, type, onStatusToggle }) => {
  const navigate = useNavigate();
  const [loadingStatus, setLoadingStatus] = useState({});
  const [error, setError] = useState(null);

  const handleStatusToggle = async (recordId, currentStatus, e) => {
    e.stopPropagation();
    setLoadingStatus((prev) => ({ ...prev, [recordId]: true }));
    setError(null);

    try {
      await onStatusToggle(recordId, !currentStatus);
    } catch (err) {
      setError(err.message || "Failed to update status");
    } finally {
      setLoadingStatus((prev) => ({ ...prev, [recordId]: false }));
    }
  };

  const handleRecordClick = (record) => {
    switch (type) {
      case "medical":
        navigate(`/medical-record/${record._id}`);
        break;
      case "blood":
        navigate(`/blood-reports/${record._id}`);
        break;
      case "surgery":
        navigate(`/surgery/${record._id}`);
        break;
      case "vaccination":
        navigate(`/vaccination/${record._id}`);
        break;
      default:
        break;
    }
  };

  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {type === "medical" && "Medical History"}
          {type === "blood" && "Blood Reports"}
          {type === "surgery" && "Surgery History"}
          {type === "vaccination" && "Vaccination History"}
        </h2>
        <p className="text-gray-500 text-base">
          No records found for this pet.
        </p>
      </div>
    );
  }

  // Sort records by date (newest first)
  const sortedRecords = [...records].sort((a, b) => {
    const dateA = new Date(
      a.date || a.sampleCollectedDate || a.surgeryDate || a.dateAdministered
    );
    const dateB = new Date(
      b.date || b.sampleCollectedDate || b.surgeryDate || b.dateAdministered
    );
    return dateB - dateA;
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-100">
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <h2 className="text-xl font-semibold text-gray-900 mb-5 pb-2 border-b border-gray-200">
        {type === "medical" && "Medical History"}
        {type === "blood" && "Blood Reports"}
        {type === "surgery" && "Surgery History"}
        {type === "vaccination" && "Vaccination History"}
      </h2>

      <div className="relative">
        {/* Flowing river timeline */}
        <div className="absolute left-5 top-0 h-full w-1">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <path
              d={`M 0.5,0 Q 2,${sortedRecords.length * 15} 0.5,${
                sortedRecords.length * 60
              }
                Q -1,${sortedRecords.length * 90} 0.5,${
                sortedRecords.length * 120
              }`}
              stroke="url(#riverGradient)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient
                id="riverGradient"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="space-y-8 pl-10">
          {sortedRecords.map((record, index) => {
            const recordDate =
              record.date ||
              record.sampleCollectedDate ||
              record.surgeryDate ||
              record.dateAdministered;

            // Vary the dot size slightly for organic feel
            const dotSize = 4 + (index % 3);

            return (
              <div
                key={record._id}
                className="relative group"
                onClick={() => handleRecordClick(record)}
              >
                {/* Organic dot with glow effect */}
                <div className="absolute -left-7 top-2 flex items-center justify-center">
                  <div
                    className={`h-${dotSize} w-${dotSize} rounded-full bg-blue-500 group-hover:bg-purple-500 transition-all duration-300 z-10`}
                  ></div>
                  <div className="absolute h-6 w-6 rounded-full bg-blue-100 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
                </div>

                {/* Ripple effect container */}
                <div className="absolute -left-7 top-2 h-4 w-4 overflow-hidden">
                  <div className="relative h-full w-full">
                    <div className="absolute inset-0 rounded-full bg-blue-300 opacity-0 group-hover:opacity-40 group-hover:animate-ripple transition-all duration-1000"></div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50/50 cursor-pointer transition-all duration-200 backdrop-blur-sm bg-white/70 hover:shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800 text-base">
                        {formatDate(recordDate)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-0.5">
                        <span className="font-medium">
                          {type === "vaccination"
                            ? "Vaccine:"
                            : "Veterinarian:"}
                        </span>{" "}
                        {type === "vaccination"
                          ? record.vaccineName
                          : record.veterinarian || "Unknown"}
                      </p>
                    </div>
                    {type === "medical" && (
                      <div
                        className="relative"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusToggle &&
                            onStatusToggle(
                              record._id,
                              record.treatmentCompleted
                            );
                        }}
                      >
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium cursor-pointer
        ${loadingStatus[record._id] ? "opacity-70" : ""}
        ${
          record.treatmentCompleted
            ? "bg-green-100 text-green-800 hover:bg-green-200"
            : "bg-orange-100 text-orange-800 hover:bg-orange-200"
        }`}
                        >
                          {loadingStatus[record._id] ? (
                            <span className="inline-block h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></span>
                          ) : record.treatmentCompleted ? (
                            "Completed"
                          ) : (
                            "Ongoing"
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {type === "medical" && record.reason && (
                    <p className="mt-2 text-sm text-gray-700 truncate">
                      <span className="font-medium">Reason:</span>{" "}
                      {record.reason}
                    </p>
                  )}

                  {type === "medical" && record.diagnosis?.length > 0 && (
                    <p className="mt-1 text-sm text-gray-700 truncate">
                      <span className="font-medium">Diagnosis:</span>{" "}
                      {record.diagnosis.join(", ")}
                    </p>
                  )}

                  {type === "blood" && (
                    <p className="mt-1 text-sm text-gray-700">
                      <span className="font-medium">Tested on:</span>{" "}
                      {formatDate(record.sampleTestedDate)}
                    </p>
                  )}

                  {type === "surgery" && (
                    <p className="mt-1 text-sm text-gray-700">
                      <span className="font-medium">Type:</span>{" "}
                      {record.surgeryType}
                      {record.duration && (
                        <span className="ml-3">
                          <span className="font-medium">Duration:</span>{" "}
                          {record.duration} minutes
                        </span>
                      )}
                    </p>
                  )}

                  {type === "vaccination" && (
                    <p className="mt-1 text-sm text-gray-700">
                      <span className="font-medium">Next Due:</span>{" "}
                      {formatDate(record.nextDueDate)}
                      {record.manufacturer && (
                        <span className="ml-3">
                          <span className="font-medium">Manufacturer:</span>{" "}
                          {record.manufacturer}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
