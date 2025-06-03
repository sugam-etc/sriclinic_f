import axios from "axios";
import { API } from "../config";

const API_BASE = `${API}vaccinations`;

export const getVaccinations = () => axios.get(API_BASE);
export const getVaccination = (id) => axios.get(`${API_BASE}/${id}`);
export const createVaccination = (data) => axios.post(API_BASE, data);
export const updateVaccination = (id, data) =>
  axios.put(`${API_BASE}/${id}`, data);
export const deleteVaccination = (id) => axios.delete(`${API_BASE}/${id}`);
export const searchVaccinations = (query) =>
  axios.get(`${API_BASE}/search`, { params: query });
