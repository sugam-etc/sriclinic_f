import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus, FaTrash } from "react-icons/fa";
import MedicineForm from "../components/MedicineForm";
import {
  getAllInventory,
  updateInventoryItem,
  deleteInventoryItem,
} from "../api/inventoryService.js";
import { format, parseISO } from "date-fns";

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
      const filtered = allInventory.filter(
        (item) => item.type && item.type.toLowerCase() === "medicine"
      );
      setMedicines(filtered);
    } catch (err) {
      console.error("Failed to fetch medicines:", err);
      setError(err.message || "Failed to load medicines from inventory.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        await deleteInventoryItem(id);
        fetchMedicines();
      } catch (err) {
        console.error("Failed to delete medicine:", err);
        setError(err.message || "Failed to delete medicine.");
      }
    }
  };

  const filteredMedicines = medicines.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(term) ||
      (m.type && m.type.toLowerCase().includes(term)) ||
      (m.supplier && m.supplier.toLowerCase().includes(term))
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-red-50 rounded-lg text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchMedicines}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Retry
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
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="search"
            placeholder="Search medicines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Medicines</h3>
          <p className="text-2xl font-semibold text-indigo-600 mt-1">
            {filteredMedicines.length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Units</h3>
          <p className="text-2xl font-semibold text-indigo-600 mt-1">
            {totalUnits}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
          <p className="text-2xl font-semibold text-indigo-600 mt-1">
            NPR {totalValue.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Supplier
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      NPR {m.sellingPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      NPR{" "}
                      {((m.sellingPrice || 0) - (m.costPrice || 0)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {m.expiryDate
                        ? format(parseISO(m.expiryDate), "MMM dd, yyyy")
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {m.supplier || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(m._id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50"
                        title="Delete"
                      >
                        <FaTrash size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No medicines found.{" "}
                    {searchTerm && "Try a different search term."}
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
