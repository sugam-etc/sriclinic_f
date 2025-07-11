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
    supplier: {
      _id: "",
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
      const formattedExpiryDate = editingItem.expiryDate
        ? new Date(editingItem.expiryDate).toISOString().split("T")[0]
        : "";

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
            : editingItem.supplier || "",
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
        resultItem = await updateInventoryItem(editingItem._id, formData);
        setInventory((prev) =>
          prev.map((item) => (item._id === resultItem._id ? resultItem : item))
        );
      } else {
        const newItem = {
          ...formData,
          lastUpdated: new Date().toISOString(),
        };
        resultItem = await addInventoryItem(newItem);
        setInventory((prev) => [...prev, resultItem]);
      }
      onCancel();
    } catch (error) {
      console.error("Failed to save inventory item:", error);
      const messageBox = document.createElement("div");
      messageBox.className =
        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
      messageBox.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow-xl text-center max-w-md">
          <p class="text-lg font-semibold text-red-600 mb-4">Error saving inventory item.</p>
          <p class="text-gray-700 mb-4">${
            error.message || "An unknown error occurred."
          }</p>
          <button class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition" onclick="this.parentNode.parentNode.remove()">Close</button>
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
    <form onSubmit={handleSubmit} className="space-y-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
            <FaBox className="text-orange-600 text-2xl" />
            Basic Information
          </h2>
          <div className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
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
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category *
                </label>
                <input
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="unitName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Unit *
                </label>
                <input
                  id="unitName"
                  name="unitName"
                  value={formData.unitName}
                  onChange={handleChange}
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stock Information */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
            <FaShoppingCart className="text-orange-600 text-2xl" />
            Stock Information
          </h2>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="threshold"
                  className="block text-sm font-medium text-gray-700 mb-2"
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
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 mb-2"
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
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="batchNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Batch Number
                </label>
                <input
                  type="text"
                  id="batchNumber"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="expiryDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Expiry Date
                </label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
            <FaDollarSign className="text-orange-600 text-2xl" />
            Pricing Information
          </h2>
          <div className="space-y-5">
            <div>
              <label
                htmlFor="costPrice"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Cost Price *
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">रू</span>
                </div>
                <input
                  type="number"
                  id="costPrice"
                  name="costPrice"
                  min="0"
                  value={formData.costPrice}
                  onChange={handleChange}
                  required
                  className="block w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="sellingPrice"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Selling Price *
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">रू</span>
                </div>
                <input
                  type="number"
                  id="sellingPrice"
                  name="sellingPrice"
                  min="0"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  required
                  className="block w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Maximum Retail Price (MRP)
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">रू</span>
                </div>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="block w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="taxRate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tax Rate (%)
              </label>
              <div className="relative rounded-lg">
                <input
                  type="number"
                  id="taxRate"
                  name="taxRate"
                  min="0"
                  max="100"
                  value={formData.taxRate}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">%</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
              <div className="flex items-center gap-2 text-sm font-medium text-orange-800 mb-2">
                <FaChartLine className="text-lg" />
                <span>Profit Analysis</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Profit per Unit</p>
                  <p className="text-sm font-bold text-gray-900">
                    रू{calculateProfit().toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Profit Margin</p>
                  <p className="text-sm font-bold text-gray-900">
                    {calculateProfitPercentage().toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supplier Information */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
            <FaUserTie className="text-orange-600 text-2xl" />
            Supplier Information
          </h2>
          <div className="space-y-5">
            <div>
              <label
                htmlFor="manufacturer"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Manufacturer
              </label>
              <input
                type="text"
                id="manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm"
              />
            </div>

            <div>
              <label
                htmlFor="supplierName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Supplier Name
              </label>
              <input
                type="text"
                id="supplierName"
                name="supplier.name"
                value={formData.supplier.name}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="supplierCompany"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Supplier Company
              </label>
              <input
                type="text"
                id="supplierCompany"
                name="supplier.company"
                value={formData.supplier.company}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="supplierPAN"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Supplier PAN
              </label>
              <input
                type="text"
                id="supplierPAN"
                name="supplier.PAN"
                value={formData.supplier.PAN}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="supplierPhone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Supplier Contact
              </label>
              <input
                type="text"
                id="supplierPhone"
                name="supplier.phone"
                value={formData.supplier.phone}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="supplierEmail"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Supplier Email
              </label>
              <input
                type="email"
                id="supplierEmail"
                name="supplier.email"
                value={formData.supplier.email}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="supplierAddress"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Supplier Address
              </label>
              <input
                type="text"
                id="supplierAddress"
                name="supplier.address"
                value={formData.supplier.address}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300 shadow-sm"
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
          className="px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 border border-transparent rounded-xl shadow-md text-lg font-medium text-white bg-orange-600 hover:bg-orange-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          Save Item
        </button>
      </div>
    </form>
  );
};

export default InventoryForm;
