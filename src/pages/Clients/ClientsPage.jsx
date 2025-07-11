import React, { useState, useEffect, useCallback } from "react";
import { FiSearch, FiX, FiPlus, FiFile, FiDownload } from "react-icons/fi";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom"; // Re-added useNavigate

// Reverting to external imports for clientService, AddClientForm, ClientList
// Please ensure these components/services are available in your project structure.
import { clientService } from "../../api/clientService";
import AddClientForm from "../../components/AddClientForm";
import ClientList from "../../components/ClientList";

// File Preview Modal Component (kept as it's a new feature, not a mock of an existing component)
const FilePreviewModal = ({ file, onClose }) => {
  if (!file) return null;

  const isImage = file.type && file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <h2 className="text-lg font-semibold text-gray-800 truncate pr-8">
            Preview: {file.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200 text-gray-600 hover:text-gray-900"
            aria-label="Close"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-grow flex items-center justify-center p-4 overflow-auto bg-gray-100">
          {isImage ? (
            <img
              src={file.url}
              alt={file.name}
              className="max-w-full max-h-full object-contain rounded-lg shadow-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/600x400/CCCCCC/666666?text=Image+Load+Error";
              }}
            />
          ) : isPdf ? (
            <iframe
              src={file.url}
              title={file.name}
              className="w-full h-full border-none rounded-lg shadow-md"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg shadow-inner border border-gray-200">
              <FiFile className="text-6xl text-gray-400 mb-4" />
              <p className="text-xl font-medium text-gray-700 mb-2">
                Cannot preview this file type.
              </p>
              <p className="text-gray-500 mb-6">
                File type: {file.type || "Unknown"}.
              </p>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                download={file.name}
                className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 shadow-md transition-all duration-300 ease-in-out font-medium"
              >
                <FiDownload className="mr-2 text-lg" /> Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body // Portal to body to ensure it's on top
  );
};

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilePreviewModal, setShowFilePreviewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate(); // Re-added useNavigate hook

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await clientService.getClients();
      setClients(data);
    } catch (error) {
      setError("Failed to fetch clients. Please try again.");
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClientAdded = useCallback((newClient) => {
    setClients((prevClients) => [...prevClients, newClient]);
    setShowForm(false);
  }, []);

  const handleFileClick = useCallback((file) => {
    setSelectedFile(file);
    setShowFilePreviewModal(true);
  }, []);

  const handleCloseFilePreviewModal = useCallback(() => {
    setShowFilePreviewModal(false);
    setSelectedFile(null);
  }, []);

  const filteredClients = clients.filter((client) => {
    const term = searchTerm.toLowerCase();
    return (
      client.owner.toLowerCase().includes(term) ||
      client.address.toLowerCase().includes(term) ||
      client.contact.toLowerCase().includes(term) ||
      (client.email && client.email.toLowerCase().includes(term))
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="px-8 py-6 bg-red-100 rounded-xl text-red-700 shadow-lg">
          <p className="text-lg font-medium">Error:</p>
          <p>{error}</p>
          <button
            onClick={fetchClients}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 shadow-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-10 lg:p-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 md:mb-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            Client Registry
          </h1>
          <div className="mt-4 md:mt-0 text-gray-500 text-lg md:text-xl font-medium">
            Total Clients:{" "}
            <span className="font-bold text-orange-500">
              {filteredClients.length}
            </span>
          </div>
        </div>

        {/* Search and Add Client */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 md:mb-10">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400 text-xl" />
            </div>
            <input
              type="text"
              placeholder="Search by owner, address, contact, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 md:py-4 border border-gray-200 rounded-xl bg-white text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 ease-in-out"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <FiX className="text-xl" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 md:py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md transition-all duration-300 ease-in-out font-medium whitespace-nowrap"
          >
            <FiPlus className="text-lg" />
            {showForm ? "Close Form" : "Add Client"}
          </button>
        </div>

        {/* Add Client Form */}
        {showForm && (
          <div className="mb-8">
            <AddClientForm
              onClientAdded={handleClientAdded}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Client List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <ClientList
            clients={filteredClients}
            searchTerm={searchTerm}
            onFileClick={handleFileClick}
          />
        </div>
      </div>

      {/* File Preview Modal */}
      {showFilePreviewModal && (
        <FilePreviewModal
          file={selectedFile}
          onClose={handleCloseFilePreviewModal}
        />
      )}
    </div>
  );
};

export default ClientsPage;
