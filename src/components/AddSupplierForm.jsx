import { useState } from "react";
import { createSupplier } from "../api/supplierService";

const AddSupplierForm = ({ onCancel, refresh }) => {
  const [form, setForm] = useState({
    name: "",
    company: "",
    PAN: "",
    phone: "",
    email: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createSupplier(form);
      setLoading(false);
      refresh(); // re-fetch suppliers list in parent
      onCancel(); // close form
    } catch (err) {
      setLoading(false);
      setError("Failed to add supplier. Please try again.");
      console.error("Failed to add supplier:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-lg border border-gray-200 space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900">Add Supplier</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Contact Name *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-indigo-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Company *
          </label>
          <input
            type="text"
            name="company"
            value={form.company}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-indigo-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">PAN *</label>
          <input
            type="text"
            name="PAN"
            value={form.PAN}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-indigo-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Phone *
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-indigo-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-indigo-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1 font-medium text-gray-700">
            Address *
          </label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-indigo-500"
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 font-medium text-center">{error}</div>
      )}

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Supplier"}
        </button>
      </div>
    </form>
  );
};

export default AddSupplierForm;
