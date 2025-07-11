import axios from "axios";
import { API } from "../config";

const API_BASE = `${API}clients`;

export const clientService = {
  getClients: async () => {
    try {
      const response = await axios.get(API_BASE);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getClientById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createClient: async (data) => {
    try {
      const response = await axios.post(API_BASE, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateClient: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE}/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteClient: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};
