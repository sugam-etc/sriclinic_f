import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const StatsCard = ({ title, value, icon, link, trend }) => {
  const isPositive = trend !== null && trend >= 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-lg p-5 hover:shadow-xl transition-all duration-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-3xl font-bold mt-1 text-gray-900">{value}</h3>
        </div>
        <div className="p-3 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
          {icon}
        </div>
      </div>

      {trend !== null && (
        <div
          className={`mt-3 flex items-center text-sm font-medium ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? (
            <FaArrowUp className="mr-1" size={12} />
          ) : (
            <FaArrowDown className="mr-1" size={12} />
          )}
          <span>
            {Math.abs(trend).toFixed(1)}% {isPositive ? "increase" : "decrease"}
          </span>
        </div>
      )}

      {link && (
        <a
          href={link}
          className="mt-4 inline-block text-sm font-medium text-orange-600 hover:text-orange-800 flex items-center group"
        >
          View details
          <span className="ml-1 text-lg group-hover:translate-x-1 transition-transform">
            →
          </span>
        </a>
      )}
    </div>
  );
};

export default StatsCard;
