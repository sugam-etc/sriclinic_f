import InventoryForm from "../components/InventoryForm";
import { useEffect, useState } from "react";
import {
  getAllInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from "../api/inventoryService.js"; // Import services

import {
  FaPlus,
  FaChevronLeft,
  FaBox,
  FaSearch,
  FaDollarSign,
  FaTag,
  FaIndustry,
  FaUserTie,
  FaShoppingCart,
  FaChartLine,
  FaTrash,
  FaEdit,
  FaMinus,
  FaPlusCircle,
} from "react-icons/fa";

const InventoryPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [editingItem, setEditingItem] = useState(null); // New state for editing item

  const toggleForm = (item = null) => {
    setEditingItem(item); // Set the item to be edited
    setShowForm((prev) => !prev);
  };

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await getAllInventory();
        setInventory(data);
      } catch (error) {
        console.error("Failed to load inventory:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const handleAddStock = async (_id, quantity) => {
    const item = inventory.find((item) => item._id === _id);
    const updatedQuantity = item.quantity + quantity;
    try {
      const updatedItem = await updateInventoryItem(_id, {
        quantity: updatedQuantity,
      });
      setInventory((prev) =>
        prev.map((item) => (item._id === _id ? updatedItem : item))
      );
    } catch (error) {
      console.error("Failed to update stock:", error);
    }
  };

  const handleReduceStock = async (id, quantity) => {
    const item = inventory.find((item) => item._id === id);
    const updatedQuantity = Math.max(0, item.quantity - quantity);
    try {
      const updatedItem = await updateInventoryItem(id, {
        quantity: updatedQuantity,
      });
      setInventory((prev) =>
        prev.map((item) => (item._id === id ? updatedItem : item))
      );
    } catch (error) {
      console.error("Failed to update stock:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteInventoryItem(id);
      setInventory((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const filteredItems = inventory
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.manufacturer &&
          item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter((item) => {
      if (activeTab === "low") return item.quantity < (item.threshold || 10);
      if (activeTab === "out") return item.quantity === 0;
      return true;
    });
  const totalInventoryValue = inventory.reduce(
    (sum, item) => sum + item.quantity * item.costPrice,
    0
  );

  const totalPotentialRevenue = inventory.reduce(
    (sum, item) => sum + item.quantity * item.sellingPrice,
    0
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            {showForm && (
              <button
                onClick={() => toggleForm()} // Call without arguments to exit edit mode
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              >
                <FaChevronLeft className="text-gray-600 text-lg" />
              </button>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              {showForm
                ? editingItem
                  ? "Edit Inventory Item"
                  : "Add Inventory Item"
                : "Inventory Management"}
            </h1>
          </div>

          {!showForm && (
            <button
              onClick={() => toggleForm()} // Call without arguments to add new item
              className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition text-lg"
            >
              <FaPlus className="text-xl" />
              <span>Add Item</span>
            </button>
          )}
        </div>

        {!showForm && (
          <div className="mt-6 relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 text-xl" />
            </div>
            <input
              type="text"
              placeholder="Search by item name, category or manufacturer..."
              className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </header>

      {showForm ? (
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <InventoryForm
            setInventory={setInventory}
            onCancel={() => toggleForm()}
            editingItem={editingItem} // Pass the editing item here
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats and Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
              <h3 className="text-lg text-gray-500 mb-2">Total Items</h3>
              <p className="text-3xl font-bold text-gray-800">
                {inventory.length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
              <h3 className="text-lg text-gray-500 mb-2">Inventory Value</h3>
              <p className="text-3xl font-bold text-gray-800">
                NPR {totalInventoryValue.toLocaleString()}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-purple-500">
              <h3 className="text-lg text-gray-500 mb-2">Potential Revenue</h3>
              <p className="text-3xl font-bold text-gray-800">
                NPR {totalPotentialRevenue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-4 font-medium text-xl flex items-center gap-3 relative ${
                activeTab === "all"
                  ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setActiveTab("low")}
              className={`px-6 py-4 font-medium text-xl flex items-center gap-3 relative ${
                activeTab === "low"
                  ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Low Stock
            </button>
            <button
              onClick={() => setActiveTab("out")}
              className={`px-6 py-4 font-medium text-xl flex items-center gap-3 relative ${
                activeTab === "out"
                  ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Out of Stock
            </button>
          </div>

          {/* Inventory Items Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-lg font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Item
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-lg font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-lg font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Stock
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-lg font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Cost
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-lg font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-left text-lg font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Profit
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-right text-lg font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center">
                            <FaBox className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-xl font-medium text-gray-900">
                              {item.name}
                            </div>
                            <div className="text-lg text-gray-500">
                              {item.manufacturer}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-lg leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xl text-gray-900">
                          {item.quantity} {item.unit}
                          {item.quantity <= item.lowStockThreshold && (
                            <span className="ml-2 text-sm text-red-600">
                              {item.quantity === 0
                                ? "(Out of stock)"
                                : "(Low stock)"}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleAddStock(item._id, 1)}
                            className="p-1 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200"
                          >
                            <FaPlusCircle />
                          </button>
                          <button
                            onClick={() => handleReduceStock(item._id, 1)}
                            disabled={item.quantity === 0}
                            className={`p-1 rounded-md ${
                              item.quantity === 0
                                ? "bg-gray-100 text-gray-400"
                                : "bg-red-100 text-red-600 hover:bg-red-200"
                            }`}
                          >
                            <FaMinus />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                        NPR {item.costPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                        NPR {item.sellingPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                        <div className="flex items-center">
                          NPR {(item.sellingPrice - item.costPrice).toFixed(2)}
                          <span className="ml-2 text-sm text-green-600">
                            (
                            {(
                              ((item.sellingPrice - item.costPrice) /
                                item.costPrice) *
                              100
                            ).toFixed(1)}
                            %)
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-lg font-medium">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => toggleForm(item)} // Pass the item to be edited
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <FaEdit className="text-xl" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FaTrash className="text-xl" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="mx-auto max-w-md">
                <FaBox className="mx-auto h-16 w-16 text-gray-300 mb-6" />
                <h3 className="text-2xl font-medium text-gray-700 mb-2">
                  No inventory items found
                </h3>
                <p className="text-xl text-gray-500 mb-6">
                  {activeTab === "all"
                    ? "Add your first inventory item to get started."
                    : activeTab === "low"
                    ? "No items are currently low on stock."
                    : "All items are currently in stock."}
                </p>
                <button
                  onClick={() => toggleForm()}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition text-xl"
                >
                  <FaPlus />
                  <span>Add Inventory Item</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
