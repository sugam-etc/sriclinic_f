import { useEffect, useState } from "react";
import AddSupplierForm from "../components/AddSupplierForm";
import { getSuppliers, deleteSupplier } from "../api/supplierService";
import { FaUserPlus, FaTrash, FaSearch } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const SuppliersPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await getSuppliers();
      setSuppliers(res.data);
    } catch (err) {
      setError("Failed to fetch suppliers. Please try again.");
      console.error("Failed to fetch suppliers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleDelete = async (id) => {
    // Custom confirmation modal instead of window.confirm
    const confirmDeletion = await new Promise((resolve) => {
      const messageBox = document.createElement("div");
      messageBox.className =
        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
      messageBox.innerHTML = `
        <div class="bg-white p-6 rounded-xl shadow-xl text-center max-w-sm mx-4">
          <p class="text-lg font-semibold text-gray-800 mb-4">Are you sure you want to delete this supplier?</p>
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
        await deleteSupplier(id);
        setSuppliers((prev) => prev.filter((s) => s._id !== id));
      } catch (err) {
        setError("Failed to delete supplier. Please try again.");
        console.error("Delete failed", err);
      }
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    [
      supplier.name,
      supplier.company,
      supplier.email,
      supplier.PAN,
      supplier.phone,
      supplier.address,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              {showForm
                ? selectedSupplier
                  ? "Edit Supplier"
                  : "Add Supplier"
                : "Suppliers"}
            </h1>
            {error && (
              <p className="mt-2 text-base text-red-600 font-medium">{error}</p>
            )}
          </div>

          <button
            onClick={() => {
              setShowForm(!showForm);
              setSelectedSupplier(null);
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-600 text-white text-lg font-semibold shadow-md hover:bg-orange-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            {showForm ? (
              <>
                <IoMdArrowRoundBack className="text-xl" /> Back to List
              </>
            ) : (
              <>
                <FaUserPlus className="text-xl" /> Add Supplier
              </>
            )}
          </button>
        </div>

        {!showForm && (
          <div className="mb-8">
            <div className="relative max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 text-lg" />
              </div>
              <input
                type="text"
                placeholder="Search suppliers by name, company, email, PAN, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg shadow-sm transition-all duration-300"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
          </div>
        ) : showForm ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <AddSupplierForm
              onCancel={() => setShowForm(false)}
              refresh={fetchSuppliers}
              selectedSupplier={selectedSupplier}
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {filteredSuppliers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        "Name",
                        "Company",
                        "PAN",
                        "Phone",
                        "Email",
                        "Address",
                        "Actions",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSuppliers.map((supplier) => (
                      <tr
                        key={supplier._id}
                        className="hover:bg-orange-50 transition-colors duration-200"
                      >
                        <td
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer hover:text-orange-600 transition-colors"
                          onClick={() => navigate(`/suppliers/${supplier._id}`)}
                        >
                          {supplier.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {supplier.company || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {supplier.PAN || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {supplier.phone || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {supplier.email || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {supplier.address || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDelete(supplier._id)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors"
                            aria-label="Delete supplier"
                          >
                            <FaTrash className="text-lg" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <p className="text-lg">
                  {searchTerm
                    ? "No matching suppliers found."
                    : "No suppliers available. Add one to get started!"}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuppliersPage;
