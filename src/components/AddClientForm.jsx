import React, { useState } from "react";
import axios from "axios"; // Assuming axios is used in clientService
import { createClient } from "../api/clientService"; // Adjusted path based on typical project structure

const AddClientForm = ({ setClients, onCancel }) => {
  const [formData, setFormData] = useState({
    owner1: "",
    owner2: "",
    address: "",
    contact: "",
    email: "",
    additionalInfo: {
      petName: "",
      species: "",
      breed: "",
      age: "",
      vaccinationStatus: "",
      notes: "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name in formData.additionalInfo) {
      setFormData((prev) => ({
        ...prev,
        additionalInfo: {
          ...prev.additionalInfo,
          [name]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      // Send data to backend using the imported createClient function
      const response = await createClient(formData);
      const newClient = response.data; // Assuming the API returns the created client

      // If setClients is provided, update the parent component's state
      if (setClients) {
        setClients((prevClients) => [...prevClients, newClient]);
      }

      // Close the form
      onCancel();
    } catch (err) {
      console.error("Failed to add client:", err);
      // Instead of alert, you might want to display a message within the UI
      // For example: setError("Failed to add client. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-lg border space-y-6 max-w-lg mx-auto my-8 font-sans"
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>
      <h2 className="text-2xl font-bold text-indigo-700 text-center mb-6">
        Add New Client
      </h2>

      {/* Client Info Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-indigo-600 border-b pb-2 mb-4">
          Client Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            name="owner1"
            placeholder="Owner 1 Name"
            value={formData.owner1}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
          />
          <input
            type="text"
            name="owner2"
            placeholder="Owner 2 Name (Optional)"
            value={formData.owner2}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
          />
          <input
            type="text"
            name="contact"
            placeholder="Contact Number"
            value={formData.contact}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address (Optional)"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
          />
        </div>
      </div>

      {/* Pet Details Section */}
      <div className="space-y-4 pt-6">
        <h3 className="text-xl font-semibold text-indigo-600 border-b pb-2 mb-4">
          Pet Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            name="petName"
            placeholder="Pet Name"
            value={formData.additionalInfo.petName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
          />
          <input
            type="text"
            name="species"
            placeholder="Species"
            value={formData.additionalInfo.species}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
          />
          <input
            type="text"
            name="breed"
            placeholder="Breed"
            value={formData.additionalInfo.breed}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
          />
          <input
            type="text"
            name="age"
            placeholder="Age"
            value={formData.additionalInfo.age}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
          />
          <input
            type="text"
            name="vaccinationStatus"
            placeholder="Vaccination Status"
            value={formData.additionalInfo.vaccinationStatus}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200"
          />
          <textarea
            name="notes"
            placeholder="Additional Notes"
            value={formData.additionalInfo.notes}
            onChange={handleChange}
            rows="3"
            className="col-span-full w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200 resize-y"
          ></textarea>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200 shadow-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200 shadow-md"
        >
          Add Client
        </button>
      </div>
    </form>
  );
};

export default AddClientForm;
