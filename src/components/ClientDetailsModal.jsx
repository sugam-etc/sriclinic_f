import React from "react";

const ClientDetailsModal = ({ client, onClose }) => {
  const info = client?.additionalInfo;

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
