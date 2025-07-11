import { useState, useEffect } from "react";
import { formatDate } from "../../utils/formatUtils";

export const PetForm = ({ initialData, onSave, onCancel, isEditing }) => {
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    age: "",
    breed: "",
    petId: "",
    registrationNumber: "",
    sex: "",
    lastAppointment: "",
    nextAppointment: "",
    ...initialData,
  });

  useEffect(() => {
    setFormData({
      name: "",
      species: "",
      age: "",
      breed: "",
      petId: "",
      registrationNumber: "",
      sex: "",
      lastAppointment: "",
      nextAppointment: "",
      ...initialData,
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200";
  const buttonClass =
    "px-6 py-2 rounded-lg shadow-md transition-all duration-200";
  const sectionHeaderClass =
    "text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200";
  const sectionContainerClass =
    "space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100";

  return (
    <div className="bg-gray-50 rounded-xl shadow-lg p-8 border border-gray-100 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-200">
        {isEditing ? "Edit Pet Details" : "Create New Pet"}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Basic Information */}
          <div className={sectionContainerClass}>
            <h3 className={sectionHeaderClass}>Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pet Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  placeholder="e.g., Buddy"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Species <span className="text-red-500">*</span>
                </label>
                <select
                  name="species"
                  value={formData.species || ""}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Select Species</option>
                  <option value="Canine">Canine (Dog)</option>
                  <option value="Feline">Feline (Cat)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Breed
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed || ""}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g., Golden Retriever"
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className={sectionContainerClass}>
            <h3 className={sectionHeaderClass}>Additional Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="text"
                  name="age"
                  value={formData.age || ""}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g., 3 years, 6 months"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Microchip No.
                </label>
                <input
                  type="text"
                  name="petId"
                  value={formData.petId || ""}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g., 900012345678901"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration No. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber || ""}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  placeholder="e.g., REG12345"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sex
                </label>
                <select
                  name="sex"
                  value={formData.sex || ""}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">Select...</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="UNKNOWN">Unknown</option>
                </select>
              </div>
            </div>
          </div>

          {/* Appointments */}
          {isEditing && (
            <div className={sectionContainerClass}>
              <h3 className={sectionHeaderClass}>Appointment History</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Visit
                  </label>
                  <input
                    type="datetime-local"
                    name="lastAppointment"
                    value={
                      formData.lastAppointment
                        ? formatDate(
                            formData.lastAppointment,
                            "yyyy-MM-dd'T'HH:mm"
                          )
                        : ""
                    }
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Next Visit
                  </label>
                  <input
                    type="datetime-local"
                    name="nextAppointment"
                    value={
                      formData.nextAppointment
                        ? formatDate(
                            formData.nextAppointment,
                            "yyyy-MM-dd'T'HH:mm"
                          )
                        : ""
                    }
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className={`${buttonClass} border border-gray-300 text-gray-700 hover:bg-gray-100`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${buttonClass} bg-orange-500 text-white hover:bg-orange-600`}
          >
            {isEditing ? "Save Changes" : "Create Pet"}
          </button>
        </div>
      </form>
    </div>
  );
};
