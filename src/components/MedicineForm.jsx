import React, { useState } from "react";

const MedicineForm = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    unitName: "",
    unit: 0,
    price: 0,
    profit: 0,
    expiryDate: "",
    manufactureDate: "",
    supplier: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "unit" || name === "price" || name === "profit"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.type || !formData.unitName) {
      alert("Please fill in Name, Type, and Unit Name.");
      return;
    }
    onAdd(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          name="name"
          type="text"
          placeholder="Medicine name"
          value={formData.name}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 p-4 text-lg focus:outline-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Type <span className="text-red-500">*</span>
        </label>
        <input
          name="type"
          type="text"
          placeholder="e.g. Tablet, Syrup"
          value={formData.type}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 p-4 text-lg focus:outline-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Unit Name <span className="text-red-500">*</span>
        </label>
        <input
          name="unitName"
          type="text"
          placeholder="e.g. Box, Bottle"
          value={formData.unitName}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 p-4 text-lg focus:outline-indigo-500"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Units
          </label>
          <input
            name="unit"
            type="number"
            min={0}
            value={formData.unit}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 p-4 text-lg focus:outline-indigo-500"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Price (₹)
          </label>
          <input
            name="price"
            type="number"
            min={0}
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 p-4 text-lg focus:outline-indigo-500"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Profit (₹)
          </label>
          <input
            name="profit"
            type="number"
            min={0}
            step="0.01"
            value={formData.profit}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 p-4 text-lg focus:outline-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Expiry Date
          </label>
          <input
            name="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 p-4 text-lg focus:outline-indigo-500"
          />
        </div>

        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-2">
            Manufacture Date
          </label>
          <input
            name="manufactureDate"
            type="date"
            value={formData.manufactureDate}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 p-4 text-lg focus:outline-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-lg font-semibold text-gray-700 mb-2">
          Supplier
        </label>
        <input
          name="supplier"
          type="text"
          placeholder="Supplier name"
          value={formData.supplier}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 p-4 text-lg focus:outline-indigo-500"
        />
      </div>

      <div className="flex justify-end gap-4 mt-8">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          Add Medicine
        </button>
      </div>
    </form>
  );
};

export default MedicineForm;
