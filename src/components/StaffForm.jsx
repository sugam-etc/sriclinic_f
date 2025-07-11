import { useState, useEffect } from "react";
import {
  FaUser,
  FaIdCard,
  FaGraduationCap,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaLock,
} from "react-icons/fa";

const StaffForm = ({ onSave, onCancel, initialData }) => {
  const [form, setForm] = useState({
    fullName: "",
    role: "",
    licenseNumber: "",
    qualifications: "",
    phone: "",
    email: "",
    joinDate: new Date().toISOString().split("T")[0],
    address: "",
    emergencyContact: "",
    notes: "",
    active: true,
    userId: "",
    password: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        joinDate: initialData.joinDate
          ? initialData.joinDate.split("T")[0]
          : new Date().toISOString().split("T")[0],
        password: "", // clear password for editing
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const staffToSave = {
        ...form,
        joinDate: new Date(form.joinDate).toISOString(),
      };
      if (initialData) {
        staffToSave._id = initialData._id;
      }
      await onSave(staffToSave);
    } catch (error) {
      console.error("Error saving staff:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100 space-y-8 font-sans"
    >
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
        {initialData ? "Edit Staff Member" : "Add Staff Member"}
      </h2>

      {/* Personal Info */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3 border-b pb-4">
          <FaUser className="text-orange-600 text-2xl" /> Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Role *
            </label>
            <input
              type="text"
              name="role"
              value={form.role}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Professional Info */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3 border-b pb-4">
          <FaIdCard className="text-orange-600 text-2xl" /> Professional
          Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              License Number
            </label>
            <input
              type="text"
              name="licenseNumber"
              value={form.licenseNumber}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Qualifications
            </label>
            <input
              type="text"
              name="qualifications"
              value={form.qualifications}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3 border-b pb-4">
          <FaPhone className="text-orange-600 text-2xl" /> Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Phone *
            </label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Join Date *
            </label>
            <input
              type="date"
              name="joinDate"
              value={form.joinDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Emergency Contact
            </label>
            <input
              type="text"
              name="emergencyContact"
              value={form.emergencyContact}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="space-y-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Address
        </label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
        ></textarea>

        <label className="block mb-2 text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
        ></textarea>
      </div>

      {/* Login Info */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-3 border-b pb-4">
          <FaLock className="text-orange-600 text-2xl" /> Login Credentials
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              User ID *
            </label>
            <input
              type="text"
              name="userId"
              value={form.userId}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required={!initialData} // Optional during edit
              className="w-full border border-gray-300 rounded-lg px-4 py-3 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 shadow-md"
        >
          {initialData ? "Save Changes" : "Add Staff Member"}
        </button>
      </div>
    </form>
  );
};

export default StaffForm;
