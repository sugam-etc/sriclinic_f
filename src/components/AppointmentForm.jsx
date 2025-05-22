import { useState } from "react";
import { createAppointment } from "../api/appointmentService";

const AppointmentForm = ({ onSuccess, onCancel }) => {
  const [form, setForm] = useState({
    clientName: "",
    petName: "",
    petType: "",
    date: "",
    time: "",
    reason: "",
    contactNumber: "",
    notes: "",
    vetName: "",
    followUpDate: "",
    priority: "Normal",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare the data for API
      const appointmentData = {
        ...form,
        // Convert empty strings to undefined for optional fields
        notes: form.notes || undefined,
        followUpDate: form.followUpDate || undefined,
        // Ensure required fields are present
        clientName: form.clientName.trim(),
        petName: form.petName.trim(),
        petType: form.petType.trim(),
        date: form.date,
        time: form.time,
        reason: form.reason.trim(),
        contactNumber: form.contactNumber.trim(),
        vetName: form.vetName.trim(),
        priority: form.priority,
        completed: false,
      };

      // Validate required fields
      if (
        !appointmentData.clientName ||
        !appointmentData.petName ||
        !appointmentData.date ||
        !appointmentData.time ||
        !appointmentData.reason ||
        !appointmentData.contactNumber ||
        !appointmentData.vetName
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Send to backend
      const response = await createAppointment(appointmentData);

      // Reset form
      setForm({
        clientName: "",
        petName: "",
        petType: "",
        date: "",
        time: "",
        reason: "",
        contactNumber: "",
        notes: "",
        vetName: "",
        followUpDate: "",
        priority: "Normal",
      });

      // Notify parent component
      if (onSuccess) onSuccess(response.data);
    } catch (err) {
      console.error("Failed to create appointment:", err);
      setError(
        err.message || "Failed to create appointment. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-lg border border-gray-200 space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900">Add New Appointment</h2>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Name */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Client Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="clientName"
            value={form.clientName}
            onChange={handleChange}
            required
            placeholder="Full name"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-indigo-500"
          />
        </div>

        {/* Pet Name */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Pet Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="petName"
            value={form.petName}
            onChange={handleChange}
            required
            placeholder="Pet's name"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-indigo-500"
          />
        </div>

        {/* Pet Type */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Pet Type <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="petType"
            value={form.petType}
            onChange={handleChange}
            required
            placeholder="Dog, Cat, etc."
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-indigo-500"
          />
        </div>

        {/* Date */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            min={new Date().toISOString().split("T")[0]} // Only allow future dates
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-indigo-500"
          />
        </div>

        {/* Time */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Time <span className="text-red-500">*</span>
          </label>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-indigo-500"
          />
        </div>

        {/* Reason */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Reason for Visit <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="reason"
            value={form.reason}
            onChange={handleChange}
            required
            placeholder="Reason for appointment"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-indigo-500"
          />
        </div>

        {/* Contact Number */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Contact Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="contactNumber"
            value={form.contactNumber}
            onChange={handleChange}
            required
            placeholder="Phone number"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-indigo-500"
          />
        </div>

        {/* Veterinarian */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Veterinarian <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="vetName"
            value={form.vetName}
            onChange={handleChange}
            required
            placeholder="Doctor's name"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-indigo-500"
          />
        </div>

        {/* Follow-up Date */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Follow-up Date
          </label>
          <input
            type="date"
            name="followUpDate"
            value={form.followUpDate}
            onChange={handleChange}
            min={form.date || new Date().toISOString().split("T")[0]}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-indigo-500"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Priority
          </label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-indigo-500"
          >
            <option value="Normal">Normal</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block mb-1 font-medium text-gray-700">
          Additional Notes
        </label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="Optional notes"
          rows={4}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-indigo-500 resize-none"
        />
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </span>
          ) : (
            "Save Appointment"
          )}
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;
