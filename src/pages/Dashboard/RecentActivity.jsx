import React from "react";
import { FaUser, FaPaw, FaSyringe, FaClipboard } from "react-icons/fa";
import { format, parseISO } from "date-fns";

const activityIcons = {
  appointment: <FaUser className="text-orange-500 text-lg" />,
  patient: <FaPaw className="text-orange-500 text-lg" />,
  vaccination: <FaSyringe className="text-orange-500 text-lg" />,
  medicalRecord: <FaClipboard className="text-orange-500 text-lg" />,
};

const RecentActivity = ({
  appointments = [],
  medicalRecords = [],
  vaccinations = [],
}) => {
  const allActivities = [
    ...appointments.slice(0, 3).map((appt) => ({
      ...appt,
      type: "appointment",
      date: appt.date,
      title: `Appointment with ${appt.petName || "N/A"}`,
      description: `Scheduled for ${appt.time || "N/A"}`,
    })),
    ...medicalRecords.slice(0, 3).map((record) => ({
      ...record,
      type: "medicalRecord",
      date: record.date,
      title: `Medical record for ${
        record.patient?.name ||
        (typeof record.patient === "string" ? record.patient : "N/A")
      }`,
      description: record.diagnosis?.[0] || "No diagnosis provided",
    })),
    ...vaccinations.slice(0, 3).map((vacc) => ({
      ...vacc,
      type: "vaccination",
      date: vacc.date,

      title: `Vaccination for ${
        vacc.patient?.name ||
        (typeof vacc.patient === "string" ? vacc.patient : "N/A")
      }`,
      description: `Administered ${vacc.vaccineName || "unknown vaccine"}`,
    })),
  ];

  const sortedActivities = allActivities
    .sort((a, b) => {
      try {
        const dateA = a.date ? parseISO(a.date) : new Date(0);
        const dateB = b.date ? parseISO(b.date) : new Date(0);
        return dateB - dateA;
      } catch (e) {
        return 0;
      }
    })
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-lg p-4 md:p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-5">
        Recent Activity
      </h2>

      {sortedActivities.length === 0 ? (
        <p className="text-gray-500 text-sm">No recent activity</p>
      ) : (
        <div className="space-y-4">
          {sortedActivities.map((activity, index) => (
            <div
              key={index}
              className="flex items-start pb-4 border-b border-gray-100 last:border-0 last:pb-0"
            >
              <div className="p-3 rounded-lg bg-orange-50 mr-4 mt-0.5 flex-shrink-0">
                {activityIcons[activity.type] || (
                  <FaClipboard className="text-orange-500 text-lg" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-medium text-gray-800">
                  {activity.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {activity.date
                    ? format(parseISO(activity.date), "MMM dd, yyyy hh:mm a")
                    : "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <a
        href="#"
        className="mt-6 inline-block text-sm font-medium text-orange-600 hover:text-orange-800 flex items-center group"
      >
        View all activity
        <span className="ml-1 text-lg group-hover:translate-x-1 transition-transform">
          →
        </span>
      </a>
    </div>
  );
};

export default RecentActivity;
