import { useState, useEffect, useRef } from "react";
import { FaPlus, FaTrash, FaFileAlt } from "react-icons/fa"; // Added FaFileAlt for file preview
import { IoMdCloseCircle } from "react-icons/io";
import {
  getAllInventory,
  deleteInventoryItem,
} from "../api/inventoryService.js"; // Assuming this path is correct
import { format, parseISO } from "date-fns";
// import InventoryForm from "../components/InventoryForm.jsx"; // Assuming this path is correct

const MedicinesPage = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");

  const modalRef = useRef(null);

  const fetchMedicines = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allInventory = await getAllInventory();
      const filtered = allInventory.filter(
        (item) => item.type?.toLowerCase() === "medicine"
      );
      setMedicines(filtered);
    } catch (err) {
      console.error("Failed to fetch medicines:", err);
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
  }, []);

  const handleDelete = async (id) => {
    // Replaced window.confirm with a custom modal for better UI/UX
    setModalTitle("Confirm Deletion");
    setModalContent(
      <div className="p-4 text-center">
        <p className="text-gray-700 mb-4">
          Are you sure you want to delete this medicine? This action cannot be
          undone.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={async () => {
              try {
                await deleteInventoryItem(id);
                fetchMedicines();
                setShowModal(false);
              } catch (err) {
                console.error("Failed to delete medicine:", err);
                setError(
                  err.message || "Failed to delete medicine. Please try again."
                );
                setShowModal(false);
              }
            }}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
          >
            Delete
          </button>
          <button
            onClick={() => setShowModal(false)}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </div>
    );
    setShowModal(true);
  };

  const handlePreviewFile = (fileUrl, fileName) => {
    setModalTitle(fileName || "File Preview");
    setModalContent(
      <div className="flex justify-center items-center p-4 bg-gray-100 rounded-lg">
        {/* Basic image preview. For more complex files (PDFs, etc.), you'd need a more robust viewer */}
        {fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
          <img
            src={fileUrl}
            alt="Preview"
            className="max-w-full max-h-[70vh] rounded-lg shadow-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/400x300/e0e0e0/555555?text=Failed+to+load+image";
            }}
          />
        ) : (
          <div className="text-center text-gray-600">
            <p className="text-lg font-semibold mb-2">
              Cannot display preview for this file type.
            </p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:underline"
            >
              Click here to open the file in a new tab.
            </a>
          </div>
        )}
      </div>
    );
    setShowModal(true);
  };

  const filteredMedicines = medicines.filter((m) => {
    const term = searchTerm.toLowerCase();
    return (
      m.name?.toLowerCase().includes(term) ||
      m.type?.toLowerCase().includes(term) ||
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

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowModal(false);
      }
    };
    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
        <p className="ml-4 text-xl text-gray-700 font-medium">
          Loading medicines...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow-lg text-center my-12 border border-red-200">
        <p className="text-red-600 mb-6 font-semibold text-lg">
          Error: {error}
        </p>
        <button
          onClick={fetchMedicines}
          className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition duration-300 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
        >
          Retry Loading Medicines
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-inter antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div className="mb-6 md:mb-0">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              Medicines Inventory
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Efficiently manage your pharmacy's medicine stock
            </p>
          </div>
        </div>

        {/* Add Medicine Form
        {showForm && (
          <div className="mb-10 p-8 bg-white rounded-2xl shadow-xl border border-gray-100 animate-fade-in">
            <InventoryForm
              onSuccess={() => {
                setShowForm(false);
                fetchMedicines();
              }}
            />
          </div>
        )} */}

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="search"
              placeholder="Search by name, type, supplier, or batch number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-sm text-lg text-gray-700 placeholder-gray-400 transition duration-200 ease-in-out"
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="h-6 w-6 text-gray-400"
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

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-7 border border-gray-100 flex flex-col items-start">
            <h3 className="text-base font-medium text-gray-500 mb-2">
              Total Medicines
            </h3>
            <p className="text-4xl font-bold text-orange-600">
              {filteredMedicines.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-7 border border-gray-100 flex flex-col items-start">
            <h3 className="text-base font-medium text-gray-500 mb-2">
              Total Units in Stock
            </h3>
            <p className="text-4xl font-bold text-orange-600">{totalUnits}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-7 border border-gray-100 flex flex-col items-start">
            <h3 className="text-base font-medium text-gray-500 mb-2">
              Total Inventory Value
            </h3>
            <p className="text-4xl font-bold text-orange-600">
              NPR {totalValue.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Medicines Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Name",
                    "Type",
                    "Unit",
                    "Qty",
                    "Profit/Unit",
                    "Expiry",
                    "Batch No.",
                    "Manufacturer",
                    "Supplier",
                    "Actions",
                  ].map((header) => (
                    <th
                      key={header}
                      className={`px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                        header === "Actions" || header === "Attachments"
                          ? "text-right"
                          : "text-left"
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredMedicines.length > 0 ? (
                  filteredMedicines.map((m) => (
                    <tr
                      key={m._id}
                      className="hover:bg-orange-50/20 transition duration-150 ease-in-out"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {m.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {m.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {m.unitName || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {m.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        NPR{" "}
                        {((m.sellingPrice || 0) - (m.costPrice || 0)).toFixed(
                          2
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {m.expiryDate
                          ? format(parseISO(m.expiryDate), "MMM dd, yyyy")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {m.batchNumber || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {m.manufacturer || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {m.supplier?.name || "-"}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(m._id)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition duration-150 ease-in-out"
                          title="Delete Medicine"
                        >
                          <FaTrash size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="11" // Updated colspan to match the number of headers
                      className="px-6 py-12 text-center text-lg text-gray-500"
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

      {/* Modal Component */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-auto transform transition-all duration-300 ease-out scale-95 opacity-0 animate-scale-in"
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h3 className="text-2xl font-semibold text-gray-800">
                {modalTitle}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 transition duration-200 ease-in-out p-2 rounded-full hover:bg-gray-100"
                title="Close"
              >
                <IoMdCloseCircle size={24} />
              </button>
            </div>
            <div className="p-6">{modalContent}</div>
          </div>
        </div>
      )}

      {/* Tailwind CSS Custom Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default MedicinesPage;
