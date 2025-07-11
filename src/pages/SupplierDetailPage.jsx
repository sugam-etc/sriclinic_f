import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIdCard,
  FaArrowLeft,
} from "react-icons/fa";
import { MdOutlineInventory } from "react-icons/md";
import { useParams, useNavigate } from "react-router-dom";
import { getSupplierById } from "../api/supplierService";

function SupplierDetailPage() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const [supplierData, setSupplierData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSupplierData = async () => {
      try {
        setLoading(true);
        const response = await getSupplierById(supplierId);
        setSupplierData(response.data);
      } catch (err) {
        setError("Failed to fetch Supplier data.");
        console.error("Error fetching Supplier data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (supplierId) {
      fetchSupplierData();
    }
  }, [supplierId]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans">
        <p className="text-xl text-red-600 font-semibold">{error}</p>
      </div>
    );
  }

  if (!supplierData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-sans">
        <p className="text-xl text-gray-700">No supplier data found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-orange-600 hover:text-orange-800 mb-6 text-lg font-medium transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2 text-xl" /> Back to Suppliers
        </button>

        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Supplier Details
        </h1>

        {/* Supplier Information Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
            <FaBuilding className="text-orange-600 text-2xl" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            <p className="text-gray-700 flex items-center text-lg">
              <span className="font-semibold mr-2">Name:</span>{" "}
              {supplierData.name}
            </p>
            <p className="text-gray-700 flex items-center text-lg">
              <span className="font-semibold mr-2">Company:</span>{" "}
              {supplierData.company}
            </p>
            <p className="text-gray-700 flex items-center text-lg">
              <span className="font-semibold mr-2">PAN:</span>{" "}
              {supplierData.PAN || "-"}
            </p>
            <p className="text-gray-700 flex items-center text-lg">
              <span className="font-semibold mr-2">Phone:</span>{" "}
              {supplierData.phone}
            </p>
            <p className="text-gray-700 flex items-center text-lg">
              <span className="font-semibold mr-2">Email:</span>{" "}
              {supplierData.email}
            </p>
            <p className="text-gray-700 flex items-center text-lg">
              <span className="font-semibold mr-2">Address:</span>{" "}
              {supplierData.address}
            </p>
          </div>
        </div>

        {/* Supply History Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-3">
            <MdOutlineInventory className="text-orange-600 text-2xl" />
            Supply History
          </h2>

          {supplierData.supplyHistory &&
          supplierData.supplyHistory.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Batch No.
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Supply Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cost Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Selling Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {supplierData.supplyHistory.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-orange-50 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                        {item.type}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                        {item.unitName}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                        {item.batchNumber}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                        NPR {item.costPrice?.toFixed(2) || "0.00"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">
                        NPR {item.sellingPrice?.toFixed(2) || "0.00"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600 italic text-lg text-center py-8">
              No supply history found for this supplier.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SupplierDetailPage;
