import { useEffect, useState } from "react";
import {
  FaBox,
  FaTag,
  FaIndustry,
  FaUserTie,
  FaShoppingCart,
  FaChartLine,
  FaDollarSign,
  FaInfoCircle,
} from "react-icons/fa";
import { addInventoryItem, updateInventoryItem } from "../api/inventoryService";
const InventoryForm = ({ onCancel, editingItem, setInventory }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "Medicine",
    manufacturer: "",
    supplier: "",
    batchNumber: "",
    expiryDate: "",
    quantity: 0,
    unitName: "", // Changed from unitName to unit
    costPrice: 0,
    sellingPrice: 0,
    price: 0, // Changed from price to mrp as per your form input
    threshold: 0, // Changed from lowStockThreshold to threshold
    taxRate: 0,
    location: "Main Storage",
    notes: "", // Changed from description to notes
  });

  useEffect(() => {
    if (editingItem) {
      // Format expiryDate to YYYY-MM-DD for the input type="date"
      const formattedExpiryDate = editingItem.expiryDate
        ? new Date(editingItem.expiryDate).toISOString().split("T")[0]
        : "";

      setFormData({
        name: editingItem.name || "",
        description: editingItem.description || "",
        type: editingItem.type || "Medicine",
        manufacturer: editingItem.manufacturer || "",
        supplier: editingItem.supplier || "",
        batchNumber: editingItem.batchNumber || "",
        expiryDate: formattedExpiryDate,
        quantity: editingItem.quantity || 0,
        unitName: editingItem.unitName || "",
        costPrice: editingItem.costPrice || 0,
        sellingPrice: editingItem.sellingPrice || 0,
        price: editingItem.price || 0,
        threshold: editingItem.threshold || 0,
        taxRate: editingItem.taxRate || 0,
        location: editingItem.location || "Main Storage",
        notes: editingItem.notes || "",
      });
    }
  }, [editingItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "quantity" ||
        name === "costPrice" ||
        name === "sellingPrice" ||
        name === "price" ||
        name === "threshold" ||
        name === "taxRate"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingItem) {
        // Update existing item
        const updatedItem = await updateInventoryItem(
          editingItem._id,
          formData
        );
        setInventory((prev) =>
          prev.map((item) =>
            item._id === updatedItem._id ? updatedItem : item
          )
        );
        console.log("Updating inventory data:", formData);
      } else {
        // Add new item
        const newItem = {
          ...formData,
          lastUpdated: new Date().toISOString(),
        };
        const addedItem = await addInventoryItem(newItem);
        setInventory((prev) => [...prev, addedItem]);
        console.log("Adding inventory data:", newItem);
      }
      onCancel(); // Close form
    } catch (error) {
      console.error("Failed to save inventory item:", error);
      alert("Error saving inventory item.");
    }
  };
  const calculateProfit = () => {
    return formData.sellingPrice - formData.costPrice;
  };

  const calculateProfitPercentage = () => {
    return formData.costPrice > 0
      ? ((formData.sellingPrice - formData.costPrice) / formData.costPrice) *
          100
      : 0;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaBox className="text-indigo-600" />
            Basic Information
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Item Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="category"
                  className="block text-lg font-medium text-gray-700 mb-1"
                >
                  Category *
                </label>
                <input
                  id="type"
                  name="type"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
              </div>

              <div>
                <label
                  htmlFor="unit"
                  className="block text-lg font-medium text-gray-700 mb-1"
                >
                  Unit *
                </label>
                <input
                  id="unitName"
                  name="unitName"
                  value={formData.unitName}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stock Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaShoppingCart className="text-indigo-600" />
            Stock Information
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-lg font-medium text-gray-700 mb-1"
                >
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
              </div>

              <div>
                <label
                  htmlFor="lowStockThreshold"
                  className="block text-lg font-medium text-gray-700 mb-1"
                >
                  Low Stock Threshold *
                </label>
                <input
                  type="number"
                  id="threshold"
                  name="threshold"
                  min="0"
                  value={formData.threshold}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Storage Location *
              </label>

              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="batchNumber"
                  className="block text-lg font-medium text-gray-700 mb-1"
                >
                  Batch Number
                </label>
                <input
                  type="text"
                  id="batchNumber"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
              </div>

              <div>
                <label
                  htmlFor="expiryDate"
                  className="block text-lg font-medium text-gray-700 mb-1"
                >
                  Expiry Date
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaDollarSign className="text-indigo-600" />
            Pricing Information
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="costPrice"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Cost Price *
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-lg">रू</span>
                </div>
                <input
                  type="number"
                  id="costPrice"
                  name="costPrice"
                  min="0"
                  value={formData.costPrice}
                  onChange={handleChange}
                  required
                  className="block w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="sellingPrice"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Selling Price *
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-lg">रू</span>
                </div>
                <input
                  type="number"
                  id="sellingPrice"
                  name="sellingPrice"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  required
                  className="block w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="mrp"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Maximum Retail Price (MRP)
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-lg">रू</span>
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="block w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="taxRate"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Tax Rate (%)
              </label>
              <div className="relative rounded-lg shadow-sm">
                <input
                  type="number"
                  id="taxRate"
                  name="taxRate"
                  min="0"
                  max="100"
                  value={formData.taxRate}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-lg">%</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-lg font-medium text-blue-800 mb-2">
                <FaChartLine />
                <span>Profit Analysis</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Profit per Unit</p>
                  <p className="text-xl font-bold">
                    रू{calculateProfit().toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Profit Margin</p>
                  <p className="text-xl font-bold">
                    {calculateProfitPercentage().toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supplier Information */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaUserTie className="text-indigo-600" />
            Supplier Information
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="manufacturer"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Manufacturer
              </label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>

            <div>
              <label
                htmlFor="supplier"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Supplier
              </label>
              <input
                type="text"
                id="supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Additional Notes
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Save Item
        </button>
      </div>
    </form>
  );
};

export default InventoryForm;
