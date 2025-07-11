import { useState } from "react";
import { patientService } from "../../../api/patientService";
import { BACKEND_URL } from "../../../config";
export const AttachmentsSection = ({
  attachments = [],
  patientId,
  onUpdate,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAddAttachment = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size exceeds 10MB limit");
      }

      // Create FormData object
      const formData = new FormData();
      formData.append("attachment", file); // This must match the multer field name
      if (description) {
        formData.append("description", description);
      }

      await patientService.addAttachment(patientId, formData);
      await onUpdate();
      setIsAdding(false);
      setFile(null);
      setDescription("");
    } catch (err) {
      setError(err.message || "Failed to add attachment");
      console.error("Attachment error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      setLoading(true);
      await patientService.deleteAttachment(patientId, attachmentId);
      await onUpdate();
    } catch (err) {
      setError(err.message || "Failed to delete attachment");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAttachment = async (attachmentId) => {
    try {
      const response = await patientService.downloadAttachment(
        patientId,
        attachmentId
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Find the attachment to get the original filename
      const attachment = attachments.find((a) => a._id === attachmentId);
      link.setAttribute("download", attachment?.fileName || "attachment");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err.message || "Failed to download attachment");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Attachments</h3>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
        >
          {isAdding ? "Cancel" : "Add Attachment"}
        </button>
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                placeholder="Brief description of the file"
              />
            </div>
            <button
              onClick={handleAddAttachment}
              disabled={loading || !file}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-orange-300 text-sm"
            >
              {loading ? "Uploading..." : "Upload Attachment"}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
        </div>
      )}

      {attachments.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No attachments found</p>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  File Name
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Uploaded
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {attachments.map((attachment) => (
                <tr key={attachment._id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {console.log(
                      `${BACKEND_URL}uploads/${attachment.filePath}`
                    )}
                    <a
                      href={`${BACKEND_URL}uploads/${attachment.filePath}`}
                      target="__blank"
                    >
                      {attachment.fileName}
                    </a>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {attachment.description || "-"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(attachment.uploadedAt).toLocaleDateString()}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-2">
                    <button
                      onClick={() => handleDownloadAttachment(attachment._id)}
                      className="text-orange-600 hover:text-orange-900"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDeleteAttachment(attachment._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
