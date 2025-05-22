import { useState } from "react";
import StaffForm from "../components/StaffForm";
import {
  FaPlus,
  FaChevronLeft,
  FaSearch,
  FaUser,
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaCalendarAlt,
  FaEdit,
  FaTrash,
  FaUserShield,
  FaUserNurse,
  FaUserCog,
} from "react-icons/fa";
import {
  getStaffs,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../api/staffService.js";
import { useEffect } from "react";
const StaffsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [staffMembers, setStaffMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch staff members from backend
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await getStaffs();
        setStaffMembers(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching staff:", error);
        setIsLoading(false);
      }
    };
    fetchStaff();
  }, []);

  const toggleForm = () => {
    setShowForm((prev) => !prev);
    if (showForm) {
      setSelectedStaff(null);
    }
  };

  const handleAddStaff = async (newStaff) => {
    try {
      const response = await createStaff(newStaff);
      setStaffMembers((prev) => [...prev, response.data]);
      toggleForm();
    } catch (error) {
      console.error("Error adding staff:", error);
    }
  };

  const handleEditStaff = async (updatedStaff) => {
    try {
      const response = await updateStaff(updatedStaff._id, updatedStaff);
      setStaffMembers((prev) =>
        prev.map((staff) =>
          staff._id === updatedStaff._id ? response.data : staff
        )
      );
      toggleForm();
    } catch (error) {
      console.error("Error updating staff:", error);
    }
  };

  const handleDeleteStaff = async (staffId) => {
    try {
      await deleteStaff(staffId);
      setStaffMembers((prev) => prev.filter((staff) => staff._id !== staffId));
    } catch (error) {
      console.error("Error deleting staff:", error);
    }
  };

  const filteredStaff = staffMembers
    .filter(
      (staff) =>
        staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((staff) => {
      if (activeTab === "active") return staff.active;
      if (activeTab === "vets") return staff.role === "Veterinarian";
      return true;
    });

  const roleIcons = {
    Veterinarian: <FaUserShield className="text-blue-600" />,
    Nurse: <FaUserNurse className="text-green-600" />,
    Technician: <FaUserCog className="text-purple-600" />,
    default: <FaUser className="text-gray-600" />,
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            {showForm && (
              <button
                onClick={toggleForm}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
              >
                <FaChevronLeft className="text-gray-600 text-lg" />
              </button>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              {showForm
                ? selectedStaff
                  ? "Edit Staff"
                  : "Add Staff"
                : "Staff Members"}
            </h1>
          </div>

          {!showForm && (
            <button
              onClick={() => {
                setSelectedStaff(null); // Ensure no staff is selected for editing when adding new
                toggleForm();
              }}
              className="flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition text-lg"
            >
              <FaPlus className="text-xl" />
              <span>Add Staff</span>
            </button>
          )}
        </div>

        {!showForm && (
          <div className="mt-6 relative max-w-2xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 text-xl" />
            </div>
            <input
              type="text"
              placeholder="Search by name, role or license..."
              className="block w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        )}
      </header>

      {showForm ? (
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {/* Pass selectedStaff for editing, otherwise it's for adding */}
          <StaffForm
            onSave={selectedStaff ? handleEditStaff : handleAddStaff}
            onCancel={toggleForm}
            initialData={selectedStaff} // Pass initial data for editing
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Tabs */}
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-4 font-medium text-xl relative ${
                activeTab === "all"
                  ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All Staff
            </button>
            <button
              onClick={() => setActiveTab("vets")}
              className={`px-6 py-4 font-medium text-xl relative ${
                activeTab === "vets"
                  ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Veterinarians
            </button>
            <button
              onClick={() => setActiveTab("active")}
              className={`px-6 py-4 font-medium text-xl relative ${
                activeTab === "active"
                  ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Active Staff
            </button>
          </div>

          {/* Staff Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStaff.map((staff) => (
              <div
                key={staff.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 border-indigo-500 hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 h-14 w-14 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">
                      {roleIcons[staff.role] || roleIcons.default}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800">
                        {staff.fullName}
                      </h3>
                      <p className="text-lg text-indigo-600">{staff.role}</p>

                      <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaIdCard className="text-gray-400" />
                          <span>{staff.licenseNumber || "No license"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaPhone className="text-gray-400" />
                          <span>{staff.phone}</span>
                        </div>
                        {staff.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <FaEnvelope className="text-gray-400" />
                            <span>{staff.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaCalendarAlt className="text-gray-400" />
                          <span>
                            Joined:{" "}
                            {new Date(staff.joinDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setSelectedStaff(staff);
                        toggleForm();
                      }}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(staff._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredStaff.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="mx-auto max-w-md">
                <FaUser className="mx-auto h-16 w-16 text-gray-300 mb-6" />
                <h3 className="text-2xl font-medium text-gray-700 mb-2">
                  No staff members found
                </h3>
                <p className="text-xl text-gray-500 mb-6">
                  {searchTerm
                    ? "No matching staff found. Try a different search."
                    : "Add your first staff member to get started."}
                </p>
                <button
                  onClick={() => {
                    setSelectedStaff(null); // Ensure no staff is selected for editing
                    toggleForm();
                  }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition text-xl"
                >
                  <FaPlus />
                  <span>Add Staff Member</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StaffsPage;
