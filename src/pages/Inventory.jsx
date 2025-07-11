import { useState, useEffect } from "react";
import InventoryForm from "../components/InventoryForm";
import {
  getAllInventory,
  updateInventoryItem,
  deleteInventoryItem,
} from "../api/inventoryService";
import {
  FaBox,
  FaSearch,
  FaPlus,
  FaTrash,
  FaEdit,
  FaChevronLeft,
} from "react-icons/fa";

const InventoryPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState(null);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllInventory();
      setInventory(data);
    } catch (error) {
      setError("Failed to load inventory. Please try again.");
      console.error("Failed to load inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const toggleForm = (item = null) => {
    setEditingItem(item);
    setShowForm(!showForm);
  };

  const handleStockUpdate = async (id, newQuantity) => {
    try {
      const updatedItem = await updateInventoryItem(id, {
        quantity: newQuantity,
      });
      setInventory((prev) => prev.map((i) => (i._id === id ? updatedItem : i)));
    } catch (error) {
      setError("Failed to update stock. Please try again.");
      console.error("Failed to update stock:", error);
    }
  };

  const handleDelete = async (id) => {
    // Custom confirmation modal instead of window.confirm
    const confirmDeletion = await new Promise((resolve) => {
      const messageBox = document.createElement("div");
      messageBox.className =
        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
      messageBox.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow-xl text-center max-w-sm mx-4">
          <p class="text-lg font-semibold text-gray-800 mb-4">Are you sure you want to delete this item?</p>
          <div class="flex justify-center gap-4">
            <button id="cancelDelete" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition">Cancel</button>
            <button id="confirmDelete" class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">Delete</button>
          </div>
        </div>
      `;
      document.body.appendChild(messageBox);

      document.getElementById("cancelDelete").onclick = () => {
        messageBox.remove();
        resolve(false);
      };
      document.getElementById("confirmDelete").onclick = () => {
        messageBox.remove();
        resolve(true);
      };
    });

    if (confirmDeletion) {
      try {
        await deleteInventoryItem(id);
        setInventory((prev) => prev.filter((item) => item._id !== id));
      } catch (error) {
        setError("Failed to delete item. Please try again.");
        console.error("Failed to delete item:", error);
      }
    }
  };

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (typeof item.supplier === "string" &&
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase()));

    if (activeTab === "low")
      return matchesSearch && item.quantity <= (item.threshold || 10);
    if (activeTab === "out") return matchesSearch && item.quantity === 0;
    return matchesSearch;
  });

  const totalInventoryValue = inventory.reduce(
    (sum, item) => sum + item.quantity * item.costPrice,
    0
  );

  return (
    <div className="min-h-screen bg-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {showForm
                ? editingItem
                  ? "Edit Inventory Item"
                  : "Add Inventory Item"
                : "Inventory Management"}
            </h1>
            {error && (
              <p className="mt-2 text-base text-red-600 font-medium">{error}</p>
            )}
          </div>

          {!showForm && (
            <button
              onClick={() => toggleForm()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 text-lg"
            >
              <FaPlus className="text-xl" /> Add Item
            </button>
          )}
        </div>

        {showForm ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <InventoryForm
              setInventory={setInventory}
              onCancel={() => toggleForm()}
              editingItem={editingItem}
            />
          </div>
        ) : (
          <div className="space-y-8">
            {!loading && (
              <div className="relative max-w-2xl">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400 text-lg" />
                </div>
                <input
                  type="text"
                  placeholder="Search inventory by name, type, or manufacturer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg shadow-sm transition-all duration-300"
                />
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-orange-500">
                    <h3 className="text-lg text-gray-500 mb-2 font-medium">
                      Total Items
                    </h3>
                    <p className="text-3xl font-bold text-gray-900">
                      {inventory.length}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-green-500">
                    <h3 className="text-lg text-gray-500 mb-2 font-medium">
                      Inventory Value
                    </h3>
                    <p className="text-3xl font-bold text-gray-900">
                      NPR {totalInventoryValue.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-xl border-l-4 border-red-500">
                    <h3 className="text-lg text-gray-500 mb-2 font-medium">
                      Low Stock Items
                    </h3>
                    <p className="text-3xl font-bold text-gray-900">
                      {
                        inventory.filter(
                          (i) => i.quantity <= (i.threshold || 10)
                        ).length
                      }
                    </p>
                  </div>
                </div>

                <div className="flex border-b border-gray-200">
                  {["all", "low", "out"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-4 text-lg font-medium relative transition-colors duration-300 ${
                        activeTab === tab
                          ? "text-orange-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-orange-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab === "all"
                        ? "All Items"
                        : tab === "low"
                        ? "Low Stock"
                        : "Out of Stock"}
                    </button>
                  ))}
                </div>

                {filteredItems.length > 0 ? (
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {[
                              "Item",
                              "Category",
                              "Stock",
                              "Cost",
                              "Price",
                              "Unit",
                              "Actions",
                            ].map((header) => (
                              <th
                                key={header}
                                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                              >
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredItems.map((item) => (
                            <tr
                              key={item._id}
                              className="hover:bg-orange-50 transition-colors duration-200"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center text-xl">
                                    <FaBox className="text-orange-600" />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {item.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {item.manufacturer}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {item.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-800">
                                  {item.quantity}
                                  {item.quantity <= (item.threshold || 10) && (
                                    <span className="ml-2 text-xs text-red-600 font-medium">
                                      {item.quantity === 0
                                        ? "(Out of stock)"
                                        : "(Low stock)"}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                NPR {item.costPrice?.toFixed(2) || "0.00"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                NPR {item.sellingPrice?.toFixed(2) || "0.00"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {item.unitName || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => toggleForm(item)}
                                    className="text-orange-600 hover:text-orange-800 p-2 rounded-full hover:bg-orange-100 transition-colors"
                                    title="Edit"
                                  >
                                    <FaEdit className="text-lg" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item._id)}
                                    className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors"
                                    title="Delete"
                                  >
                                    <FaTrash className="text-lg" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                    <FaBox className="mx-auto h-20 w-20 text-gray-300 mb-6" />
                    <h3 className="text-3xl font-semibold text-gray-800 mb-3">
                      {activeTab === "all"
                        ? "No inventory items found"
                        : activeTab === "low"
                        ? "No low stock items"
                        : "No out of stock items"}
                    </h3>
                    <button
                      onClick={() => toggleForm()}
                      className="mt-6 px-8 py-4 bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 text-xl"
                    >
                      Add Inventory Item
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryPage;
