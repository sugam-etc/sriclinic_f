// MedicationsTable.jsx
export const MedicationsTable = ({ medications }) => {
  if (!medications || medications.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200 shadow-sm">
        <p className="text-gray-600 text-sm">
          No medications prescribed for this visit.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h4 className="font-semibold text-gray-900 mb-4 text-lg pb-2 border-b border-gray-200">
        Medications Prescribed
      </h4>
      <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
              >
                Medication
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
              >
                Dosage
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
              >
                Frequency
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
              >
                Duration
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {medications.map((med, medIndex) => (
              <tr
                key={med._id || medIndex}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center mr-3">
                      <svg
                        className="h-4 w-4 text-orange-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {med.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Qty: {med.quantity}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {med.dosage || "As directed"}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {med.frequency}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                  {med.duration}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
