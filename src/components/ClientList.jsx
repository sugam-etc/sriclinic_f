// components/ClientList.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const ClientList = ({ clients, searchTerm }) => {
  const navigate = useNavigate();

  return (
    <section className="overflow-hidden rounded-xl shadow-lg border border-gray-100 bg-white">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-50">
          {" "}
          {/* Changed from indigo-50 to gray-50 for a cleaner look */}
          <tr>
            {["Owner", "Address", "Contact", "Email", "Actions"].map(
              (heading) => (
                <th
                  key={heading}
                  className="text-left px-6 py-4 text-gray-800 font-semibold tracking-wide border-b border-gray-200" // Adjusted text color and border
                >
                  {heading}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {clients.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="text-center py-12 text-gray-500 italic select-none"
              >
                No clients found. {searchTerm && `(for "${searchTerm}")`}
              </td>
            </tr>
          ) : (
            clients.map((client) => (
              <tr
                key={client._id}
                className="border-b border-gray-100 hover:bg-orange-50 transition-colors duration-150 cursor-pointer" // Subtle orange hover, added transition
                onClick={() => navigate(`/patients/client/${client._id}`)} // Make entire row clickable
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {client.owner}
                </td>
                <td className="px-6 py-4 text-gray-700">{client.address}</td>
                <td className="px-6 py-4 text-gray-700">{client.contact}</td>
                <td className="px-6 py-4 text-gray-700">
                  {client.email || "N/A"}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click from firing when button is clicked
                      navigate(`/patients/client/${client._id}`);
                    }}
                    className="text-orange-600 hover:text-orange-800 hover:underline text-sm font-medium transition-colors duration-150" // Orange theme for link
                  >
                    View Patients
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  );
};

export default ClientList;
