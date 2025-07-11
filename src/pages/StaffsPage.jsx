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
    // Custom confirmation modal instead of window.confirm
    const confirmDeletion = await new Promise((resolve) => {
      const messageBox = document.createElement("div");
      messageBox.className =
        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
      messageBox.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow-xl text-center max-w-sm mx-4">
          <p class="text-lg font-semibold text-gray-800 mb-4">Are you sure you want to delete this staff member?</p>
          <div class="flex justify-center gap-4">
            <button id="cancelDelete" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition">Cancel</button>
            <button id="confirmDelete" class="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition">Delete</button>
          </div>
        </div>
      `;
      document.body.appendChild(messageBox);

      document.getElementById("cancelDelete").onclick = () => {
        messageBox.remove();
        resolve(false);
      };
      document.getElementById("confirmDelete").onclick = () => {
        messageBox.remove();
        resolve(true);
      };
    });

    if (confirmDeletion) {
      try {
        await deleteStaff(staffId);
        setStaffMembers((prev) =>
          prev.filter((staff) => staff._id !== staffId)
        );
      } catch (error) {
        console.error("Error deleting staff:", error);
      }
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
    Veterinarian: <FaUserShield className="text-orange-600" />,
    Nurse: <FaUserNurse className="text-orange-600" />,
    Technician: <FaUserCog className="text-orange-600" />,
    default: <FaUser className="text-orange-600" />,
  };

  return (
    <div className="min-h-screen bg-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="flex items-center gap-4">
              {showForm && (
                <button
                  onClick={toggleForm}
                  className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300"
                >
                  <FaChevronLeft className="text-gray-600 text-xl" />
                </button>
              )}
              <h1 className="text-4xl font-bold text-gray-900">
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
                className="flex items-center justify-center gap-3 px-6 py-3 bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 text-lg"
              >
                <FaPlus className="text-xl" />
                <span>Add Staff</span>
              </button>
            )}
          </div>

          {!showForm && (
            <div className="mt-6 relative max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 text-lg" />
              </div>
              <input
                type="text"
                placeholder="Search by name, role or license..."
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-orange-500 focus:border-orange-500 text-lg transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </header>

        {showForm ? (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
            <StaffForm
              onSave={selectedStaff ? handleEditStaff : handleAddStaff}
              onCancel={toggleForm}
              initialData={selectedStaff}
            />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Tabs */}
            <div className="flex space-x-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-6 py-4 text-lg font-medium relative transition-colors duration-300 ${
                  activeTab === "all"
                    ? "text-orange-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-orange-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                All Staff
              </button>
              <button
                onClick={() => setActiveTab("vets")}
                className={`px-6 py-4 text-lg font-medium relative transition-colors duration-300 ${
                  activeTab === "vets"
                    ? "text-orange-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-orange-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Veterinarians
              </button>
              <button
                onClick={() => setActiveTab("active")}
                className={`px-6 py-4 text-lg font-medium relative transition-colors duration-300 ${
                  activeTab === "active"
                    ? "text-orange-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-orange-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Active Staff
              </button>
            </div>

            {/* Staff Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStaff.map((staff) => (
                <div
                  key={staff.id}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center text-3xl">
                        {roleIcons[staff.role] || roleIcons.default}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          {staff.fullName}
                        </h3>
                        <p className="text-lg text-orange-600 font-medium">
                          {staff.role}
                        </p>

                        <div className="mt-4 space-y-2 text-gray-700">
                          <div className="flex items-center gap-2">
                            <FaIdCard className="text-gray-500" />
                            <span>{staff.licenseNumber || "No license"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FaPhone className="text-gray-500" />
                            <span>{staff.phone}</span>
                          </div>
                          {staff.email && (
                            <div className="flex items-center gap-2">
                              <FaEnvelope className="text-gray-500" />
                              <span>{staff.email}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-500" />
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
                        className="p-3 text-orange-600 hover:bg-orange-100 rounded-full transition-colors duration-200"
                        title="Edit Staff"
                      >
                        <FaEdit className="text-xl" />
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(staff._id)}
                        className="p-3 text-red-600 hover:bg-red-100 rounded-full transition-colors duration-200"
                        title="Delete Staff"
                      >
                        <FaTrash className="text-xl" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredStaff.length === 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
                <div className="mx-auto max-w-md">
                  <FaUser className="mx-auto h-20 w-20 text-gray-300 mb-6" />
                  <h3 className="text-3xl font-semibold text-gray-800 mb-3">
                    No staff members found
                  </h3>
                  <p className="text-xl text-gray-500 mb-8">
                    {searchTerm
                      ? "No matching staff found. Try a different search."
                      : "Add your first staff member to get started."}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedStaff(null);
                      toggleForm();
                    }}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-orange-600 text-white rounded-xl shadow-md hover:bg-orange-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 text-xl"
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
    </div>
  );
};

export default StaffsPage;
