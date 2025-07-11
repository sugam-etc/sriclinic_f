// medicalRecordService.js
import axios from "axios";
import { API } from "../config";

const API_BASE = `${API}medical-records`;

export const medicalRecordService = {
  createMedicalRecord: async (formData) => {
    try {
      const response = await axios.post(API_BASE, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  addMedicalRecordOnly: async (petId, recordData) => {
    try {
      const response = await axios.post(`${API_BASE}/append`, {
        petId,
        ...recordData,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getRecordsByPatient: async (patientId) => {
    try {
      const response = await axios.get(`${API_BASE}/patient/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getRecordById: async (recordId) => {
    try {
      const response = await axios.get(`${API_BASE}/${recordId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateRecord: async (recordId, formData) => {
    try {
      const response = await axios.put(`${API_BASE}/${recordId}`, formData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // File operations
  downloadFile: async (recordId, fileType, fileId) => {
    try {
      const response = await axios.get(
        `${API_BASE}/${recordId}/files/${fileType}/${fileId}/download`,
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

  deleteFile: async (recordId, fileType, fileId) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/${recordId}/files/${fileType}/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // File upload methods
  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  addConsentForm: async (recordId, file) => {
    const formData = new FormData();
    formData.append("consentForm", file);

    try {
      const response = await axios.post(
        `${API_BASE}/${recordId}/consent-forms`,
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

  addMedicalReportFile: async (recordId, file) => {
    const formData = new FormData();
    formData.append("medicalReport", file);

    try {
      const response = await axios.post(
        `${API_BASE}/${recordId}/medical-reports`,
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

  addSurgeryReportFile: async (recordId, file) => {
    const formData = new FormData();
    formData.append("surgeryReport", file);

    try {
      const response = await axios.post(
        `${API_BASE}/${recordId}/surgery-reports`,
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

  addVaccinationReportFile: async (recordId, file) => {
    const formData = new FormData();
    formData.append("vaccinationReport", file);

    try {
      const response = await axios.post(
        `${API_BASE}/${recordId}/vaccination-reports`,
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

  toggleTreatmentStatus: async (recordId) => {
    try {
      const response = await axios.patch(
        `${API_BASE}/${recordId}/toggle-status`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
