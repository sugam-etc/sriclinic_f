import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getAllBloodReports,
  deleteBloodReport,
} from "../../api/bloodReportService";
import { FiSearch, FiPlus, FiEdit, FiTrash, FiEye } from "react-icons/fi";
import { format } from "date-fns";

const BloodReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  useEffect(() => {
    fetchBloodReports();
  }, []);

  const fetchBloodReports = async () => {
    setLoading(true);
    try {
      const data = await getAllBloodReports();
      setReports(data);
      console.log(data);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to fetch blood reports");
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setReportToDelete(id);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteBloodReport(reportToDelete);
      setReports(reports.filter((report) => report._id !== reportToDelete));
      setShowConfirmModal(false);
      setReportToDelete(null);
    } catch (err) {
      setError(err.message || "Failed to delete blood report");
      setShowConfirmModal(false);
      setReportToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmModal(false);
    setReportToDelete(null);
  };

  const filteredReports = reports.filter((report) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      report.patient?.name?.toLowerCase().includes(searchLower) ||
      report.patient?.client?.owner?.toLowerCase().includes(searchLower) ||
      report.patient?.petId?.toLowerCase().includes(searchLower) ||
      report.patient?.registrationNumber?.toLowerCase().includes(searchLower) ||
      report.veterinarian?.toLowerCase().includes(searchLower) ||
      (report.sampleTestedDate &&
        format(new Date(report.sampleTestedDate), "MMM dd, yyyy")
          .toLowerCase()
          .includes(searchLower))
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 font-inter p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Blood Reports</h1>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400 text-lg" />
              </div>
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition duration-200 text-base"
              />
            </div>
            <Link
              to="/blood-reports/new"
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-xl shadow-md hover:bg-orange-600 transition duration-200 text-base font-semibold w-full sm:w-auto justify-center"
            >
              <FiPlus className="text-lg" /> Create New Report
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-orange-100 border border-orange-200 text-orange-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-3xl shadow-xl">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="bg-white shadow-xl overflow-hidden rounded-3xl border border-gray-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pet Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Species
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Test Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Veterinarian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredReports.length > 0 ? (
                    filteredReports.map((report, index) => (
                      <tr
                        key={report._id}
                        className="hover:bg-gray-50 transition duration-150 ease-in-out"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {report.patient?.name || "N/A"}
                              </div>
                              {report.patient?.petId && (
                                <div className="text-sm text-gray-500">
                                  ID: {report.patient.petId}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {report.patient?.client?.owner || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {report.patient?.species || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {report.sampleTestedDate
                            ? format(
                                new Date(report.sampleTestedDate),
                                "MMM dd, yyyy"
                              )
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {report.veterinarian || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/blood-reports/${report._id}`}
                              className="text-gray-600 hover:text-orange-500 p-2 rounded-full hover:bg-gray-200 transition duration-200"
                              title="View/Edit"
                            >
                              <FiEye className="text-lg" />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(report._id)}
                              className="text-gray-600 hover:text-red-500 p-2 rounded-full hover:bg-gray-200 transition duration-200"
                              title="Delete"
                            >
                              <FiTrash className="text-lg" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No blood reports found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this blood report? This action
              cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelDelete}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-6 py-2 rounded-xl transition duration-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-xl shadow-md transition duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodReports;
