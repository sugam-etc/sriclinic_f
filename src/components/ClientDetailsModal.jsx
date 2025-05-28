import React, { useState } from "react";
import { FaTrash, FaSpinner } from "react-icons/fa"; // Import FaSpinner for loading indicator
import { deleteClient } from "../api/clientService";

const ClientDetailsModal = ({ client, onClose, onDeleteSuccess }) => {
  const info = client?.additionalInfo;
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null); // New state for success message

  // Handler for the initial "Delete Client" button click
  const handleDeleteClick = () => {
    setShowConfirm(true);
    setDeleteError(null); // Clear previous errors
    setSuccessMessage(null); // Clear previous success messages
  };

  // Handler for confirming the deletion
  const confirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null); // Clear errors before attempting deletion
    setSuccessMessage(null); // Clear success message before attempting deletion

    try {
      // Attempt to delete the client via the API
      await deleteClient(client._id);
      console.log(
        "Client deleted successfully (API call resolved):",
        client._id
      );

      setIsDeleting(false);
      setSuccessMessage("Client deleted successfully!"); // Set a success message for the user

      // Safely call the onDeleteSuccess prop if it's provided by the parent.
      // This is crucial for the parent component to update its data (e.g., re-fetch the client list).
      if (onDeleteSuccess) {
        onDeleteSuccess();
      } else {
        console.warn(
          "onDeleteSuccess prop was not provided to ClientDetailsModal. Parent component might not update automatically."
        );
      }

      // Close the modal after a short delay to allow the user to see the success message
      setTimeout(() => {
        onClose();
      }, 1000); // Modal closes after 1.5 seconds
    } catch (error) {
      console.error("Error deleting client:", error);
      // This catch block is executed if the deleteClient API call returns a non-2xx status code
      // (e.g., 404, 500), even if the item was technically deleted on the backend.
      let errorMessage = "Failed to delete client. Please try again.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message; // Use error message from backend if available
      } else if (error.message) {
        errorMessage = error.message; // Fallback to generic error message
      }
      setDeleteError(errorMessage); // Display the error message
      setIsDeleting(false); // Stop loading state
      setShowConfirm(false); // Go back to the initial delete button state on error
    }
  };

  // Handler for canceling the deletion
  const cancelDelete = () => {
    setShowConfirm(false);
    setDeleteError(null); // Clear any error message
    setSuccessMessage(null); // Clear any success message
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">
          Additional Information
        </h2>
        {info ? (
          <div className="grid grid-cols-1 gap-4 text-sm text-gray-700">
            <div className="flex justify-between border-b py-2">
              <span className="font-semibold">Pet Name:</span>
              <span>{info.petName}</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="font-semibold">Species:</span>
              <span>{info.species}</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="font-semibold">Breed:</span>
              <span>{info.breed}</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="font-semibold">Age:</span>
              <span>{info.age}</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="font-semibold">Vaccination Status:</span>
              <span>{info.vaccinationStatus}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-semibold">Notes:</span>
              <span>{info.notes}</span>
            </div>

            {/* Display success message */}
            {successMessage && (
              <p className="text-green-600 text-center mt-2 font-semibold">
                {successMessage}
              </p>
            )}

            {/* Display error message */}
            {deleteError && (
              <p className="text-red-500 text-center mt-2">{deleteError}</p>
            )}

            {!showConfirm ? (
              <button
                className="mt-4 w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                <FaTrash className="mr-2" /> Delete Client
              </button>
            ) : (
              <div className="mt-4 p-4 border border-red-300 rounded-md bg-red-50 text-center">
                <p className="text-red-700 font-semibold mb-3">
                  Are you sure you want to delete this client? This action
                  cannot be undone.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out flex items-center"
                    onClick={confirmDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      <FaTrash className="mr-2" />
                    )}
                    {isDeleting ? "Deleting..." : "Yes, Delete"}
                  </button>
                  <button
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
                    onClick={cancelDelete}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-400 italic text-center py-6">
            No additional info provided.
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetailsModal;
