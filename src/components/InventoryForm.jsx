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
// Assuming these are correctly imported from your API service
import { addInventoryItem, updateInventoryItem } from "../api/inventoryService"; // Assuming this path is correct

const InventoryForm = ({ onCancel, editingItem, setInventory }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "Medicine",
    manufacturer: "",
    supplier: {
      // Supplier is now an object for form input
      _id: "", // To store the actual supplier ID if editing
      name: "",
      company: "",
      PAN: "",
      phone: "",
      email: "",
      address: "",
    },
    batchNumber: "",
    expiryDate: "",
    quantity: 0,
    unitName: "",
    costPrice: 0,
    sellingPrice: 0,
    price: 0,
    threshold: 0,
    taxRate: 0,
    location: "Main Storage",
    notes: "",
  });

  useEffect(() => {
    if (editingItem) {
      // Format expiryDate to YYYY-MM-DD for the input type="date"
      const formattedExpiryDate = editingItem.expiryDate
        ? new Date(editingItem.expiryDate).toISOString().split("T")[0]
        : "";

      // Determine if supplier is populated or just an ID string
      const isSupplierPopulated =
        typeof editingItem.supplier === "object" &&
        editingItem.supplier !== null;

      setFormData({
        name: editingItem.name || "",
        description: editingItem.description || "",
        type: editingItem.type || "Medicine",
        manufacturer: editingItem.manufacturer || "",
        supplier: {
          _id: isSupplierPopulated
            ? editingItem.supplier._id
            : editingItem.supplier || "",
          name: isSupplierPopulated
            ? editingItem.supplier.name
            : editingItem.supplier || "", // If not populated, assume the string is the name/ID
          company: isSupplierPopulated
            ? editingItem.supplier.company || ""
            : "",
          PAN: isSupplierPopulated ? editingItem.supplier.PAN || "" : "",
          phone: isSupplierPopulated ? editingItem.supplier.phone || "" : "",
          email: isSupplierPopulated ? editingItem.supplier.email || "" : "",
          address: isSupplierPopulated
            ? editingItem.supplier.address || ""
            : "",
        },
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

    // Handle nested supplier fields
    if (name.startsWith("supplier.")) {
      const supplierFieldName = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        supplier: {
          ...prev.supplier,
          [supplierFieldName]: value,
        },
      }));
    } else {
      // Handle top-level fields
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let resultItem;
      if (editingItem) {
        // Update existing item
        resultItem = await updateInventoryItem(editingItem._id, formData);
        setInventory((prev) =>
          prev.map((item) => (item._id === resultItem._id ? resultItem : item))
        );
        console.log("Updating inventory data:", formData);
      } else {
        // Add new item
        const newItem = {
          ...formData,
          lastUpdated: new Date().toISOString(),
        };
        resultItem = await addInventoryItem(newItem);
        setInventory((prev) => [...prev, resultItem]); // Add the returned item with populated supplier
        console.log("Adding inventory data:", newItem);
      }
      onCancel(); // Close form
    } catch (error) {
      console.error("Failed to save inventory item:", error);
      // Using a custom modal or toast for alerts instead of window.alert()
      const messageBox = document.createElement("div");
      messageBox.className =
        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
      messageBox.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl text-center">
          <p class="text-lg font-semibold text-red-600 mb-4">Error saving inventory item.</p>
          <p class="text-gray-700 mb-4">${
            error.message || "An unknown error occurred."
          }</p>
          <button class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700" onclick="this.parentNode.parentNode.remove()">Close</button>
        </div>
      `;
      document.body.appendChild(messageBox);
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
                  htmlFor="type"
                  className="block text-lg font-medium text-gray-700 mb-1"
                >
                  Category *
                </label>
                <input
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                />
              </div>

              <div>
                <label
                  htmlFor="unitName"
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
                  htmlFor="threshold"
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
                htmlFor="price"
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
                htmlFor="supplierName"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Supplier Name
              </label>
              <input
                type="text"
                id="supplierName"
                name="supplier.name"
                value={formData.supplier.name}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>
            <div>
              <label
                htmlFor="supplierCompany"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Supplier Company
              </label>
              <input
                type="text"
                id="supplierCompany"
                name="supplier.company"
                value={formData.supplier.company}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>
            <div>
              <label
                htmlFor="supplierPAN"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Supplier PAN
              </label>
              <input
                type="text"
                id="supplierPAN"
                name="supplier.PAN"
                value={formData.supplier.PAN}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>
            <div>
              <label
                htmlFor="supplierPhone"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Supplier Contact
              </label>
              <input
                type="text"
                id="supplierPhone"
                name="supplier.phone"
                value={formData.supplier.phone}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>
            <div>
              <label
                htmlFor="supplierEmail"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Supplier Email
              </label>
              <input
                type="email"
                id="supplierEmail"
                name="supplier.email"
                value={formData.supplier.email}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              />
            </div>
            <div>
              <label
                htmlFor="supplierAddress"
                className="block text-lg font-medium text-gray-700 mb-1"
              >
                Supplier Address
              </label>
              <input
                type="text"
                id="supplierAddress"
                name="supplier.address"
                value={formData.supplier.address}
                onChange={handleChange}
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
