// surgeryService.js
import axios from "axios";
import { API } from "../config";

const API_BASE = `${API}surgeries`;

export const surgeryService = {
  getAllSurgeries: async () => {
    try {
      const response = await axios.get(API_BASE);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  getSurgeryById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  getSurgeriesByPatient: async (patientId) => {
    try {
      const response = await axios.get(`${API_BASE}/patient/${patientId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  createSurgery: async (data) => {
    try {
      const response = await axios.post(API_BASE, data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  updateSurgery: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE}/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  deleteSurgery: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },
};
