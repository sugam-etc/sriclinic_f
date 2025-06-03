import { useState, useEffect } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import MedicineForm from "../components/MedicineForm";
import { IoMdCloseCircle } from "react-icons/io";
import {
  getAllInventory,
  deleteInventoryItem,
} from "../api/inventoryService.js";
import { format, parseISO } from "date-fns";
import InventoryForm from "../components/InventoryForm.jsx";

const MedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMedicines = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allInventory = await getAllInventory();
      // Ensure 'type' property exists before calling toLowerCase
      const filtered = allInventory.filter(
        (item) => item.type?.toLowerCase() === "medicine"
      );
      setMedicines(filtered);
    } catch (err) {
      console.error("Failed to fetch medicines:", err);
      // It's good practice to display a more user-friendly message
      setError(
        err.message ||
          "Failed to load medicines from inventory. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []); // Empty dependency array means this runs once on mount

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this medicine? This action cannot be undone."
      )
    ) {
      try {
        await deleteInventoryItem(id);
        // Re-fetch medicines after successful deletion to update the list
        fetchMedicines();
      } catch (err) {
        console.error("Failed to delete medicine:", err);
        setError(err.message || "Failed to delete medicine. Please try again.");
      }
    }
  };

  const filteredMedicines = medicines.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      m.name?.toLowerCase().includes(term) ||
      m.type?.toLowerCase().includes(term) ||
      // Access the supplier's name for searching
      m.supplier?.name?.toLowerCase().includes(term) ||
      m.batchNumber?.toLowerCase().includes(term)
    );
  });

  const totalUnits = filteredMedicines.reduce(
    (sum, m) => sum + (m.quantity || 0),
    0
  );
  const totalValue = filteredMedicines.reduce(
    (sum, m) => sum + (m.quantity || 0) * (m.sellingPrice || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="ml-3 text-lg text-gray-700">Loading medicines...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-red-50 rounded-lg text-center shadow-md">
        <p className="text-red-600 mb-4 font-semibold">Error: {error}</p>
        <button
          onClick={fetchMedicines}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Retry Loading Medicines
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold text-gray-800">
            Medicines Inventory
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your pharmacy's medicine stock
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {showForm ? (
            <IoMdCloseCircle className="mr-2" />
          ) : (
            <FaPlus className="mr-2" />
          )}{" "}
          {showForm ? "Close Form" : "Add New Medicine"}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 bg-white rounded-xl shadow-md">
          {/* On successful submission, hide the form and re-fetch medicines */}
          <InventoryForm
            onSuccess={() => {
              setShowForm(false);
              fetchMedicines();
            }}
          />
        </div>
      )}

      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="search"
            placeholder="Search by name, type, supplier, or batch number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Medicines</h3>
          <p className="text-2xl font-semibold text-indigo-600 mt-1">
            {filteredMedicines.length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">
            Total Units in Stock
          </h3>
          <p className="text-2xl font-semibold text-indigo-600 mt-1">
            {totalUnits}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">
            Total Inventory Value
          </h3>
          <p className="text-2xl font-semibold text-indigo-600 mt-1">
            NPR {totalValue.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Name",
                  "Type",
                  "Unit",
                  "Qty",

                  "Profit/Unit", // Changed to Profit/Unit for clarity
                  "Expiry",
                  "Batch No.", // Added Batch Number
                  "Manufacturer", // Added Manufacturer
                  "Supplier",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      header === "Actions" ? "text-right" : "text-left"
                    }`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedicines.length > 0 ? (
                filteredMedicines.map((m) => (
                  <tr key={m._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {m.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {m.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {m.unitName || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {m.quantity}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      NPR {(m.costPrice || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      NPR {(m.sellingPrice || 0).toFixed(2)}
                    </td> */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      NPR{" "}
                      {((m.sellingPrice || 0) - (m.costPrice || 0)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {m.expiryDate
                        ? format(parseISO(m.expiryDate), "MMM dd, yyyy") // Corrected format string
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {m.batchNumber || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {m.manufacturer || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {/* Access the 'name' property of the supplier object */}
                      {m.supplier?.name || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(m._id)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition duration-150 ease-in-out"
                        title="Delete Medicine"
                      >
                        <FaTrash size={16} />
                      </button>
                      {/* You might add an edit button here */}
                      {/* <button
                        onClick={() => handleEdit(m._id)}
                        className="text-indigo-600 hover:text-indigo-900 ml-2 p-2 rounded-full hover:bg-indigo-50"
                        title="Edit"
                      >
                        <FaEdit size={16} />
                      </button> */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="12" // Updated colspan to match the number of headers
                    className="px-6 py-8 text-center text-md text-gray-500"
                  >
                    No medicines found.{" "}
                    {searchTerm && (
                      <span className="font-semibold">
                        Try a different search term.
                      </span>
                    )}
                    {!searchTerm && (
                      <span className="font-semibold">
                        Click "Add New Medicine" to get started.
                      </span>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MedicinesPage;
