import React, { useState, useEffect, useMemo } from "react";
import {
  getAllInventory,
  deleteInventoryItem, // Import delete function
} from "../api/inventoryService.js"; // Import inventory service
import {
  format,
  parseISO,
  addDays,
  addMonths,
  isBefore,
  isAfter,
  isEqual,
  startOfDay, // Import startOfDay for accurate date comparisons
} from "date-fns";

function ExpiredItemsPage() {
  const [inventory, setInventory] = useState([]); // All inventory items
  const [filterRange, setFilterRange] = useState("expired"); // Options: "expired", "week", "month"
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // State for confirmation modal
  const [itemToDelete, setItemToDelete] = useState(null); // State to store the item to be deleted

  // State for sorting: { key: 'name', direction: 'ascending' | 'descending' }
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  // Function to fetch all inventory items
  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // This now uses the actual getAllInventory from your service
      const data = await getAllInventory();
      setInventory(data);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setError(err.message || "Failed to load inventory items.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch inventory on component mount
  useEffect(() => {
    fetchInventory();
  }, []);

  // Memoized filtered and sorted items for display
  const displayedItems = useMemo(() => {
    const today = startOfDay(new Date()); // Compare from start of today
    const nextWeek = addDays(today, 7);
    const nextMonth = addMonths(today, 1);

    let filtered = inventory.filter((item) => {
      // Ensure item has an expiryDate and it's a valid date string
      if (!item.expiryDate) return false;

      let expiryDate;
      try {
        expiryDate = startOfDay(parseISO(item.expiryDate)); // Compare from start of expiry date
        if (isNaN(expiryDate.getTime())) {
          // Check if parsed date is valid
          return false;
        }
      } catch (e) {
        console.warn("Invalid expiryDate format:", item.expiryDate, e);
        return false;
      }

      // Filter by range
      let passesRangeFilter = false;
      if (filterRange === "expired") {
        passesRangeFilter = isBefore(expiryDate, today);
      } else if (filterRange === "week") {
        // Expiring today, or in the next 7 days (inclusive of today, up to end of 7th day)
        passesRangeFilter =
          (isAfter(expiryDate, today) || isEqual(expiryDate, today)) &&
          isBefore(expiryDate, nextWeek);
      } else if (filterRange === "month") {
        // Expiring today, or in the next month (inclusive of today, up to end of 30th day/month)
        passesRangeFilter =
          (isAfter(expiryDate, today) || isEqual(expiryDate, today)) &&
          isBefore(expiryDate, nextMonth);
      }

      // Filter by search term
      const term = searchTerm.toLowerCase();
      const passesSearchFilter =
        item.name.toLowerCase().includes(term) ||
        (item.category && item.category.toLowerCase().includes(term)) ||
        (item.type && item.type.toLowerCase().includes(term));

      return passesRangeFilter && passesSearchFilter;
    });

    // Apply sorting if sortConfig is set
    if (sortConfig.key !== null) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Handle specific data types for sorting
        if (sortConfig.key === "expiryDate") {
          aValue = a.expiryDate ? parseISO(a.expiryDate).getTime() : 0;
          bValue = b.expiryDate ? parseISO(b.expiryDate).getTime() : 0;
        } else if (typeof aValue === "string") {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        } else if (typeof aValue === "undefined" || aValue === null) {
          aValue = -Infinity; // Treat undefined/null as lowest for numbers, or empty string for strings
        }
        if (typeof bValue === "undefined" || bValue === null) {
          bValue = -Infinity;
        }

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [inventory, filterRange, searchTerm, sortConfig]); // Re-run when these dependencies change

  // Function to handle sort requests
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Helper to get sort indicator
  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "ascending" ? " ▲" : " ▼";
    }
    return "";
  };

  // Handler for delete button click
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowConfirmModal(true);
  };

  // Function to confirm and proceed with deletion
  const confirmDelete = async () => {
    if (itemToDelete) {
      try {
        setIsLoading(true);
        setError(null);
        await deleteInventoryItem(itemToDelete._id);
        // Re-fetch inventory to update the list after deletion
        await fetchInventory();
      } catch (err) {
        console.error("Failed to delete item:", err);
        setError(err.message || "Failed to delete item.");
      } finally {
        setShowConfirmModal(false);
        setItemToDelete(null);
        setIsLoading(false);
      }
    }
  };

  // Function to cancel deletion
  const cancelDelete = () => {
    setShowConfirmModal(false);
    setItemToDelete(null);
  };

  // Calculate total units and total value from displayed items
  const totalUnits = displayedItems.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );
  const totalValue = displayedItems.reduce(
    (sum, item) => sum + (item.quantity || 0) * (item.sellingPrice || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans">
        <p className="text-xl text-red-600 font-semibold">{error}</p>
        <button
          onClick={fetchInventory}
          className="ml-4 px-4 py-2 bg-orange-600 text-white rounded-lg shadow-md hover:bg-orange-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 text-center sm:text-left mb-8">
          Expired & Expiring Soon
        </h1>

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by name or category..."
            className="flex-grow p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg transition-all duration-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={filterRange}
            onChange={(e) => setFilterRange(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg transition-all duration-300"
            aria-label="Filter expiry range"
          >
            <option value="expired">Expired</option>
            <option value="week">Expiring in 1 Week</option>
            <option value="month">Expiring in 1 Month</option>
          </select>
        </div>

        {/* Summary Stats */}
        <section className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center bg-orange-50 p-6 rounded-2xl shadow-xl border border-orange-100">
          <div>
            <h2 className="text-3xl font-extrabold text-orange-900">
              {displayedItems.length}
            </h2>
            <p className="text-orange-700 font-medium text-lg">
              Items Displayed
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-orange-900">
              {totalUnits}
            </h2>
            <p className="text-orange-700 font-medium text-lg">Total Units</p>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-orange-900">
              NPR {totalValue.toFixed(2)}
            </h2>
            <p className="text-orange-700 font-medium text-lg">Total Value</p>
          </div>
        </section>

        {/* Table */}
        {displayedItems.length === 0 ? (
          <p className="text-gray-600 italic text-center text-xl py-8">
            No items found for the selected filter and search term.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-xl">
            <table className="min-w-full bg-white">
              <thead className="bg-orange-600 text-white">
                <tr>
                  <th
                    className="py-4 px-4 text-left font-semibold cursor-pointer hover:bg-orange-700 transition-colors rounded-tl-2xl text-sm"
                    onClick={() => requestSort("name")}
                  >
                    Name {getSortIndicator("name")}
                  </th>
                  <th
                    className="py-4 px-4 text-left font-semibold cursor-pointer hover:bg-orange-700 transition-colors text-sm"
                    onClick={() => requestSort("category")}
                  >
                    Category/Type {getSortIndicator("category")}
                  </th>
                  <th
                    className="py-4 px-4 text-left font-semibold cursor-pointer hover:bg-orange-700 transition-colors text-sm"
                    onClick={() => requestSort("quantity")}
                  >
                    Quantity {getSortIndicator("quantity")}
                  </th>
                  <th className="py-4 px-4 text-left font-semibold text-sm">
                    Unit
                  </th>
                  <th
                    className="py-4 px-4 text-left font-semibold cursor-pointer hover:bg-orange-700 transition-colors text-sm"
                    onClick={() => requestSort("sellingPrice")}
                  >
                    Selling Price (NPR) {getSortIndicator("sellingPrice")}
                  </th>
                  <th
                    className="py-4 px-4 text-left font-semibold cursor-pointer hover:bg-orange-700 transition-colors text-sm"
                    onClick={() => requestSort("expiryDate")}
                  >
                    Expiry Date {getSortIndicator("expiryDate")}
                  </th>
                  <th className="py-4 px-4 text-left font-semibold rounded-tr-2xl text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedItems.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t border-gray-200 hover:bg-orange-50 transition-colors duration-200"
                  >
                    <td className="py-3 px-4 text-gray-800 text-sm">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-gray-800 text-sm">
                      {item.category || item.type || "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-800 text-sm">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-4 text-gray-800 text-sm">
                      {item.unitName || "-"}
                    </td>
                    <td className="py-3 px-4 text-gray-800 text-sm">
                      NPR {(item.sellingPrice || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-gray-800 text-sm">
                      {item.expiryDate
                        ? format(parseISO(item.expiryDate), "MMM dd, yyyy")
                        : "-"}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteClick(item)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4 space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Confirm Deletion
              </h3>
              <p className="text-gray-700">
                Are you sure you want to delete "
                <span className="font-medium">{itemToDelete?.name}</span>"? This
                action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ExpiredItemsPage;
