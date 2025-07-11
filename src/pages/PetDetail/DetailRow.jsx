// DetailRow.jsx
export const DetailRow = ({ label, value, className = "" }) => (
  <div className={`flex items-start py-2 ${className}`}>
    <span className="w-36 flex-shrink-0 text-gray-500 text-sm font-medium">
      {label}
    </span>
    <span className="text-gray-800 text-sm font-semibold">
      {value || "N/A"}
    </span>
  </div>
);
