import axios from "axios";
import { API } from "../config";

const API_BASE = `${API}vaccinations`;

export const vaccinationService = {
  getAllVaccinations: async () => {
    try {
      const response = await axios.get(API_BASE);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getVaccinationById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getVaccinationsByPatient: async (patientId) => {
    try {
      const response = await axios.get(`${API_BASE}/patient/${patientId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error.response?.data || error.message;
    }
  },

  createVaccination: async (data) => {
    try {
      const response = await axios.post(API_BASE, data);
      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      throw new Error(errorMessage);
    }
  },

  updateVaccination: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE}/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteVaccination: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  searchVaccinations: async (query) => {
    try {
      const response = await axios.get(`${API_BASE}/search`, { params: query });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
