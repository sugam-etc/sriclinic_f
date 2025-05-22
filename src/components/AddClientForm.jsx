import React, { useState } from "react";
import axios from "axios";
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
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5000/api/clients",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const newClient = response.data; // Axios puts response body in data
      setClients((prev) => [...prev, newClient]);
      onCancel();
    } catch (error) {
      console.error("Error submitting client:", error);
      alert("There was an error adding the client. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-lg border space-y-6"
    >
      <h2 className="text-xl font-semibold text-indigo-700">Client Info</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          name="owner1"
          placeholder="Owner 1"
          value={formData.owner1}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="text"
          name="owner2"
          placeholder="Owner 2"
          value={formData.owner2}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="text"
          name="contact"
          placeholder="Contact"
          value={formData.contact}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <h3 className="text-lg font-semibold text-indigo-600">Pet Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          name="petName"
          placeholder="Pet Name"
          value={formData.additionalInfo.petName}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="text"
          name="species"
          placeholder="Species"
          value={formData.additionalInfo.species}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="text"
          name="breed"
          placeholder="Breed"
          value={formData.additionalInfo.breed}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="text"
          name="age"
          placeholder="Age"
          value={formData.additionalInfo.age}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="text"
          name="vaccinationStatus"
          placeholder="Vaccination Status"
          value={formData.additionalInfo.vaccinationStatus}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          type="text"
          name="notes"
          placeholder="Notes"
          value={formData.additionalInfo.notes}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Add Client
        </button>
      </div>
    </form>
  );
};

export default AddClientForm;
