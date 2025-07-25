import { useState, useEffect } from "react";
import {
  FaUser,
  FaPhone,
  FaShoppingCart,
  FaPercentage,
  FaMoneyBillWave,
  FaCreditCard,
  FaWallet,
  FaChartLine,
  FaNotesMedical,
  FaTimes,
} from "react-icons/fa";
import { createSale, updateSale } from "../api/saleService";
import { updateInventoryItem } from "../api/inventoryService";

const SalesForm = ({
  onSubmit,
  inventory,
  onCancel,
  selectedSale,
  // This prop is used to update the inventory state in the parent (Sales.jsx)
}) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    clientName: "",
    clientPhone: "",
    items: [],
    paymentMethod: "cash",
    taxRate: 8,
    discount: 0,
    serviceCharge: 0, // Initialize serviceCharge
    notes: "",
  });

  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null); // New state for submission errors

  const paymentMethods = [
    { value: "cash", label: "Cash", icon: <FaMoneyBillWave /> },
    { value: "card", label: "Credit Card", icon: <FaCreditCard /> },
    { value: "insurance", label: "Insurance", icon: <FaWallet /> },
    { value: "online", label: "Online", icon: <FaWallet /> },
  ];

  // Initialize form data when selectedSale changes (for editing/viewing)
  useEffect(() => {
    if (selectedSale) {
      setFormData({
        ...selectedSale,
        date: selectedSale.date.split("T")[0], // Format date for input
        // Ensure serviceCharge is initialized even if not present in older sales
        serviceCharge: selectedSale.serviceCharge || 0,
      });
    } else {
      // For new sales, reset serviceCharge and other relevant fields
      setFormData((prev) => ({
        ...prev,
        clientName: "",
        clientPhone: "",
        items: [],
        paymentMethod: "cash",
        taxRate: 8,
        discount: 0,
        serviceCharge: 0,
        notes: "",
        date: new Date().toISOString().split("T")[0], // Reset date to current
      }));
    }
    setSubmissionError(null); // Clear any previous errors on form load/reset
  }, [selectedSale]);

  // Filter available items based on current inventory stock
  useEffect(() => {
    const available = inventory.filter((item) => item.quantity > 0);

    // If editing a sale, include items that are already in the sale,
    // even if their current inventory quantity is zero or less than the sale quantity.
    if (selectedSale) {
      const saleItemsIds = selectedSale.items.map((item) => item._id);
      const outOfStockButInSale = inventory.filter(
        (item) => saleItemsIds.includes(item._id) // Check if item is part of the current sale
      );
      // Combine available items with items that are in the sale but might be out of stock
      // Ensure no duplicates by converting to a Set and back to Array
      const combinedItems = Array.from(
        new Set([...available, ...outOfStockButInSale])
      );
      setAvailableItems(combinedItems);
    } else {
      setAvailableItems(available);
    }
  }, [inventory, selectedSale]);

  // Handles changes to form input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "taxRate" || name === "discount" || name === "serviceCharge"
          ? parseFloat(value) || 0 // Parse as float for numeric inputs
          : value,
    }));
  };

  // Handles selecting an item from the dropdown
  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setQuantity(1); // Reset quantity to 1 when a new item is selected
  };

  // Adds a selected item to the sale's items list
  const addItem = () => {
    if (!selectedItem || quantity <= 0) return;

    const existingItemIndex = formData.items.findIndex(
      (item) => item._id === selectedItem._id
    );

    let updatedItems;
    if (existingItemIndex >= 0) {
      // If item already exists in sale, update its quantity
      updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += quantity;
    } else {
      // Otherwise, add new item to sale
      updatedItems = [
        ...formData.items,
        {
          _id: selectedItem._id,
          name: selectedItem.name,
          price: selectedItem.sellingPrice,
          quantity: quantity,
          costPrice: selectedItem.costPrice, // Include cost price for profit calculation
        },
      ];
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));

    setSelectedItem(null); // Clear selected item
    setQuantity(1); // Reset quantity
  };

  // Removes an item from the sale's items list
  const removeItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1); // Remove item at the specified index
    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  // Calculates subtotal, tax, service charge, and total amount for the sale
  const calculateTotals = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = subtotal * (formData.taxRate / 100);
    const totalAmount = subtotal + tax - formData.discount;
    const totalBill = totalAmount + formData.serviceCharge; // Calculate totalBill

    return { subtotal, tax, totalAmount, totalBill };
  };

  // Handles the final submission of the sale form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmissionError(null); // Clear previous errors

    try {
      const { subtotal, tax, totalAmount, totalBill } = calculateTotals(); // Get all calculated totals
      const saleData = {
        ...formData,
        subtotal,
        tax,
        totalAmount,
        totalBill, // Include totalBill in saleData
        // Ensure items array only contains necessary data for the sale record
        items: formData.items.map((item) => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          costPrice: item.costPrice,
        })),
      };

      let response;
      if (selectedSale) {
        // If editing an existing sale
        response = await updateSale(selectedSale._id, saleData);
      } else {
        // If creating a new sale
        response = await createSale(saleData);
      }

      // Update inventory quantities *after* the sale is successfully created/updated
      for (const item of formData.items) {
        const inventoryItem = inventory.find((i) => i._id === item._id);
        if (inventoryItem) {
          // Calculate the new quantity based on the sale
          // If editing, need to consider the original quantity sold vs. new quantity
          let quantityChange = item.quantity;
          if (selectedSale) {
            const originalItem = selectedSale.items.find(
              (i) => i._id === item._id
            );
            if (originalItem) {
              quantityChange = item.quantity - originalItem.quantity;
            }
          }
          const newQuantity = inventoryItem.quantity - quantityChange;
          await updateInventoryItem(item._id, { quantity: newQuantity });
        }
      }

      // Call the onSubmit prop to update the parent component's state
      onSubmit(response.data);
    } catch (error) {
      console.error("Failed to submit sale:", error);
      setSubmissionError(
        error.message || "Failed to complete sale. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const { subtotal, tax, totalAmount, totalBill } = calculateTotals(); // Destructure all calculated totals

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-sans">
      {/* Display submission error if any */}
      {submissionError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-6 shadow-md"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {submissionError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Client Information */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FaUser className="text-orange-600 text-2xl" />
            Client Information
          </h2>
          <div className="space-y-5">
            <div>
              <label
                htmlFor="clientName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Client Name *
              </label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-lg transition-all duration-300"
              />
            </div>

            <div>
              <label
                htmlFor="clientPhone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number *
              </label>
              <input
                type="tel"
                id="clientPhone"
                name="clientPhone"
                value={formData.clientPhone}
                onChange={handleChange}
                required
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-lg transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FaMoneyBillWave className="text-orange-600 text-2xl" />
            Payment Information
          </h2>
          <div className="space-y-5">
            <div>
              <label
                htmlFor="paymentMethod"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Payment Method *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                      formData.paymentMethod === method.value
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={formData.paymentMethod === method.value}
                      onChange={handleChange}
                      className="hidden"
                      required
                    />
                    <span className="text-orange-600 text-lg">
                      {method.icon}
                    </span>
                    <span className="text-sm">{method.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label
                  htmlFor="taxRate"
                  className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                >
                  <FaPercentage className="text-gray-500 text-base" />
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  id="taxRate"
                  name="taxRate"
                  min="0"
                  max="30"
                  step="0.1"
                  value={formData.taxRate}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-lg transition-all duration-300"
                />
              </div>

              <div>
                <label
                  htmlFor="discount"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Discount (रू)
                </label>
                <input
                  type="number"
                  id="discount"
                  name="discount"
                  min="0"
                  step="0.01"
                  value={formData.discount}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-lg transition-all duration-300"
                />
              </div>
              {/* Service Charge Input */}
              <div>
                <label
                  htmlFor="serviceCharge"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Service Charge (रू)
                </label>
                <input
                  type="number"
                  id="serviceCharge"
                  name="serviceCharge"
                  min="0"
                  step="0.01"
                  value={formData.serviceCharge}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-lg transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Items Selection */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FaShoppingCart className="text-orange-600 text-2xl" />
            Items
          </h2>

          {/* Item Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Item *
              </label>
              <select
                value={selectedItem?._id || ""}
                onChange={(e) => {
                  const item = availableItems.find(
                    (i) => i._id === e.target.value
                  );
                  handleItemSelect(item || null);
                }}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-lg transition-all duration-300"
              >
                <option value="">Select an item</option>
                {availableItems.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} (रू{item.sellingPrice.toFixed(2)}, Stock:{" "}
                    {item.quantity} {item.unit})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <div className="flex">
                <input
                  type="number"
                  min="1"
                  // Max quantity should be the available stock plus any quantity already added to this sale for the same item
                  max={
                    selectedItem
                      ? selectedItem.quantity +
                        (formData.items.find((i) => i._id === selectedItem._id)
                          ?.quantity || 0)
                      : 1
                  }
                  value={quantity}
                  onChange={(e) => {
                    const maxQty = selectedItem
                      ? selectedItem.quantity +
                        (formData.items.find((i) => i._id === selectedItem._id)
                          ?.quantity || 0)
                      : 1;
                    const value = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, Math.min(maxQty, value)));
                  }}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-l-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-lg transition-all duration-300"
                />

                <button
                  type="button"
                  onClick={addItem}
                  disabled={!selectedItem || quantity <= 0}
                  className={`px-4 py-3 rounded-r-lg text-lg font-medium transition-all duration-300 ${
                    !selectedItem || quantity <= 0
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-orange-600 text-white hover:bg-orange-700"
                  }`}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Selected Items Table */}
          {formData.items.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.items.map((item, index) => {
                    const inventoryItem =
                      inventory.find((i) => i._id === item._id) || {};
                    const isStockSufficient =
                      item.quantity <=
                      (inventoryItem.quantity || 0) +
                        (selectedSale?.items.find((i) => i._id === item._id)
                          ?.quantity || 0);

                    return (
                      <tr
                        key={index}
                        className="hover:bg-orange-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {item.name}
                          {!isStockSufficient && (
                            <span className="ml-2 text-xs text-red-500 font-medium">
                              (Not enough stock)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          रू{item.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          रू{(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors"
                          >
                            <FaTimes className="text-lg" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 p-6 rounded-lg text-center text-gray-500 text-lg">
              No items added to this sale yet
            </div>
          )}
        </div>

        {/* Summary & Notes */}
        <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 lg:col-span-2">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <FaChartLine className="text-orange-600 text-2xl" />
            Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-lg text-gray-700">Subtotal:</span>
                  <span className="text-lg font-medium text-gray-900">
                    रू{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lg text-gray-700">
                    Tax ({formData.taxRate}%):
                  </span>
                  <span className="text-lg font-medium text-gray-900">
                    रू{tax.toFixed(2)}
                  </span>
                </div>
                {formData.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-lg text-gray-700">Discount:</span>
                    <span className="text-lg font-medium text-red-600">
                      -रू{formData.discount.toFixed(2)}
                    </span>
                  </div>
                )}
                {formData.serviceCharge > 0 && (
                  <div className="flex justify-between">
                    <span className="text-lg text-gray-700">
                      Service Charge:
                    </span>
                    <span className="text-lg font-medium text-gray-900">
                      +रू{formData.serviceCharge.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <span className="text-xl font-bold text-gray-900">
                    Total Amount:
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    रू{totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <span className="text-xl font-bold text-gray-900">
                    Total Bill:
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    रू{totalBill.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
              >
                <FaNotesMedical className="text-gray-500 text-base" />
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-orange-500 focus:border-orange-500 text-lg transition-all duration-300"
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
          disabled={formData.items.length === 0 || isSubmitting}
          className={`px-6 py-3 border border-transparent rounded-xl shadow-md text-lg font-medium text-white transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${
            formData.items.length === 0 || isSubmitting
              ? "bg-orange-300 cursor-not-allowed"
              : "bg-orange-600 hover:bg-orange-700"
          }`}
        >
          {isSubmitting
            ? "Processing..."
            : selectedSale
            ? "Update Sale"
            : "Complete Sale"}
        </button>
      </div>
    </form>
  );
};

export default SalesForm;
