import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaIdCard,
  FaHistory,
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
        console.log("Fetched Data:", response.data);
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
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-gray-700">Loading Supplier details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  if (!supplierData) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-lg text-gray-700">No supplier data found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-blue-600 mb-4"
      >
        <FaArrowLeft className="mr-2" /> Back to Suppliers
      </button>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Supplier Details
      </h1>

      {/* Supplier Information Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 flex items-center">
              <FaBuilding className="mr-2" />
              <span className="font-medium">Name:</span> {supplierData.name}
            </p>
            <p className="text-gray-600 flex items-center">
              <FaBuilding className="mr-2" />
              <span className="font-medium">Company:</span>{" "}
              {supplierData.company}
            </p>
            <p className="text-gray-600 flex items-center">
              <FaIdCard className="mr-2" />
              <span className="font-medium">PAN:</span> {supplierData.PAN}
            </p>
          </div>
          <div>
            <p className="text-gray-600 flex items-center">
              <FaPhone className="mr-2" />
              <span className="font-medium">Phone:</span> {supplierData.phone}
            </p>
            <p className="text-gray-600 flex items-center">
              <FaEnvelope className="mr-2" />
              <span className="font-medium">Email:</span> {supplierData.email}
            </p>
            <p className="text-gray-600 flex items-center">
              <FaMapMarkerAlt className="mr-2" />
              <span className="font-medium">Address:</span>{" "}
              {supplierData.address}
            </p>
          </div>
        </div>
      </div>

      {/* Supply History Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
          <MdOutlineInventory className="mr-2" />
          Supply History
        </h2>

        {supplierData.supplyHistory && supplierData.supplyHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch No.
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supply Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost Price
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Selling Price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {supplierData.supplyHistory.map((item) => (
                  <tr key={item._id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {item.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {item.type}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {item.unitName}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {item.batchNumber}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(item.createdAt)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {item.costPrice}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600">
                      {item.sellingPrice}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-600">
            No supply history found for this supplier.
          </p>
        )}
      </div>
    </div>
  );
}

export default SupplierDetailPage;
