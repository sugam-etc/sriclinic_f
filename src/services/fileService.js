// src/services/fileService.js
import axios from "axios";
import { API } from "../config";

export const fileService = {
  uploadFile: async (file, recordId, fileType) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${API}medical-records/${recordId}/files/${fileType}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  downloadFile: async (recordId, fileType, fileId) => {
    try {
      const response = await axios.get(
        `${API}medical-records/${recordId}/files/${fileType}/${fileId}/download`,
        { responseType: "blob" }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteFile: async (recordId, fileType, fileId) => {
    try {
      const response = await axios.delete(
        `${API}medical-records/${recordId}/files/${fileType}/${fileId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
