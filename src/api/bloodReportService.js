import axios from "axios";
import { API } from "../config";

const API_BASE = `${API}blood-reports`;

export const getAllBloodReports = async () => {
  try {
    const response = await axios.get(API_BASE);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getBloodReportById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const getBloodReportsByPatient = async (patientId) => {
  try {
    const response = await axios.get(`${API_BASE}/patient/${patientId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const createBloodReport = async (reportData) => {
  try {
    const response = await axios.post(API_BASE, reportData);
    return response.data; // Ensure this returns the created report
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Failed to save blood report";
    throw new Error(errorMessage);
  }
};
export const updateBloodReport = async (id, reportData) => {
  try {
    const response = await axios.put(`${API_BASE}/${id}`, reportData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const deleteBloodReport = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE}/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};

export const searchPatient = async (identifier) => {
  try {
    const response = await axios.get(`${API}patients/identifier/${identifier}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || error.message;
  }
};
