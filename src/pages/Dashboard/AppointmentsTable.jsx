// AppointmentsTable.jsx
import React from "react";
import { FaUser, FaPaw, FaClock, FaCalendarAlt } from "react-icons/fa";
import { parseISO, format, isToday } from "date-fns";

const AppointmentsTable = ({ appointments = [] }) => {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-lg border border-gray-100">
      {appointments.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No appointments scheduled
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {appointments.map((appt) => (
            <div
              key={appt._id || Math.random().toString(36).substring(7)}
              className="p-4 transition-colors hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-orange-100">
                    <FaPaw className="text-orange-600 text-lg" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {appt.petName || "N/A"}
                    </h4>
                    <p className="text-sm text-gray-600 flex items-center mt-0.5">
                      <FaUser className="mr-2 text-gray-400" size={12} />
                      {appt.clientName || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-800 flex items-center justify-end">
                    <FaClock className="mr-2 text-gray-500" size={12} />
                    {appt.time || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center justify-end">
                    <FaCalendarAlt className="mr-2 text-gray-400" size={10} />
                    {appt.date && isToday(parseISO(appt.date))
                      ? "Today"
                      : appt.date
                      ? format(parseISO(appt.date), "MMM dd, yyyy")
                      : "N/A"}
                  </p>
                </div>
              </div>
              {appt.reason && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-700">{appt.reason}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsTable;
