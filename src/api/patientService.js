import axios from "axios";
import { API } from "../config";

const API_BASE = `${API}patients`;

export const patientService = {
  getAllPatients: async () => {
    try {
      const response = await axios.get(API_BASE);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getPatientById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/${id}`);
      return response.data; // Make sure this returns the actual patient data
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  createPatient: async (data) => {
    try {
      const response = await axios.post(API_BASE, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updatePatient: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE}/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deletePatient: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getPatientsByClient: async (clientId) => {
    try {
      const response = await axios.get(`${API_BASE}/client/${clientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
  getPatientByIdentifier: async (identifier) => {
    try {
      const response = await axios.get(`${API_BASE}/identifier/${identifier}`);
      return response.data;
    } catch (error) {
      // Return null if patient not found (404) instead of throwing error
      if (error.response?.status === 404) {
        return null;
      }
      throw error.response?.data || error.message;
    }
  },
  addAttachment: async (patientId, formData) => {
    try {
      const response = await axios.post(
        `${API_BASE}/${patientId}/attachments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data?.message ||
        error.message ||
        "Failed to add attachment"
      );
    }
  },
  deleteAttachment: async (patientId, attachmentId) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/${patientId}/attachments/${attachmentId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  downloadAttachment: async (patientId, attachmentId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/${patientId}/attachments/${attachmentId}/download`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
