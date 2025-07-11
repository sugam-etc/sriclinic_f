import axios from "axios";
import { API } from "../config";

const API_BASE = `${API}appointments`;

export const appointmentService = {
  getAppointments: async () => {
    try {
      const response = await axios.get(API_BASE);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  createAppointment: async (data) => {
    try {
      const response = await axios.post(API_BASE, data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  updateAppointment: async (id, data) => {
    try {
      const response = await axios.put(`${API_BASE}/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },

  deleteAppointment: async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || error.message;
    }
  },
};
