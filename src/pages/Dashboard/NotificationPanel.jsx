import React from "react";
import {
  FaTimes,
  FaExclamationCircle,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";

const NotificationsPanel = ({ isOpen, onClose, notifications = [] }) => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case "Expired Items":
      case "Out of Stock":
        return <FaExclamationCircle className="text-red-500 text-xl" />;
      case "Today's Appointments":
      case "Upcoming Vaccinations":
        return <FaCheckCircle className="text-orange-500 text-xl" />;
      case "Low Inventory":
      case "Expiring Items":
      case "Upcoming Follow-ups":
        return <FaExclamationCircle className="text-orange-500 text-xl" />;
      default:
        return <FaInfoCircle className="text-gray-500 text-xl" />;
    }
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white border-l border-gray-200 shadow-xl transform ${
        isOpen ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300 ease-in-out z-50 rounded-l-xl`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800">Notifications</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
          aria-label="Close notifications"
        >
          <FaTimes className="text-lg" />
        </button>
      </div>

      <div className="h-[calc(100%-120px)] overflow-y-auto">
        {" "}
        {/* Adjusted height */}
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No new notifications
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start">
                  <div className="mt-1 mr-3 flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-800">
                        {notification.type}
                      </h3>
                      <span className="text-xs text-gray-400">
                        {new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    {notification.details && (
                      <div className="mt-2 text-xs text-gray-500">
                        <ul className="list-disc list-inside space-y-1">
                          {notification.details.map((detail, i) => (
                            <li key={i}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {notification.link && (
                      <a
                        href={notification.link}
                        className="mt-2 inline-block text-xs font-medium text-orange-600 hover:text-orange-800 transition-colors"
                      >
                        View details →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50 absolute bottom-0 w-full">
        <button
          onClick={() => setNotifications([])}
          className="w-full py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={notifications.length === 0}
        >
          Clear all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationsPanel;
