import { useEffect, useState } from "react";
import AddSupplierForm from "../components/AddSupplierForm";
import { getSuppliers, deleteSupplier } from "../api/supplierService.js";
import { FaUserPlus, FaTrash, FaEdit } from "react-icons/fa"; // Added FaEdit for potential future use
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const SuppliersPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null); // State to hold supplier being edited
  const navigate = useNavigate();
  const toggleForm = () => {
    setShowForm((prev) => !prev);
    setSelectedSupplier(null); // Clear selected supplier when toggling form
  };

  const fetchSuppliers = async () => {
    try {
      const res = await getSuppliers();
      setSuppliers(res.data);
    } catch (err) {
      console.error("Failed to fetch suppliers", err);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      // Using window.confirm for simplicity, consider a custom modal for production
      try {
        await deleteSupplier(id);
        setSuppliers((prev) => prev.filter((s) => s._id !== id));
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setShowForm(true);
  };

  const handleFormSubmit = () => {
    fetchSuppliers(); // Refresh the list after add/update
    toggleForm(); // Hide the form
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-indigo-600">
          {showForm
            ? selectedSupplier
              ? "Edit Supplier"
              : "Add New Supplier"
            : "Suppliers"}
        </h1>
        <button
          onClick={toggleForm}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
        >
          {showForm ? (
            <>
              <IoMdArrowRoundBack className="text-lg" /> Back to List
            </>
          ) : (
            <>
              <FaUserPlus className="text-lg" /> Add Supplier
            </>
          )}
        </button>
      </div>

      {!showForm && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
      )}

      {showForm ? (
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          <AddSupplierForm
            onCancel={toggleForm}
            refresh={handleFormSubmit} // Pass handleFormSubmit to refresh and close form
            selectedSupplier={selectedSupplier} // Pass selected supplier for editing
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filteredSuppliers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PAN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier._id}>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 hover:cursor-pointer hover:underline"
                        onClick={() => {
                          navigate(`/suppliers/${supplier._id}`);
                        }}
                      >
                        {supplier.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supplier.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supplier.PAN}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supplier.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supplier.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {supplier.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(supplier._id)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"
                            aria-label="Delete supplier"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No suppliers found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;
