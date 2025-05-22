import axios from "axios";

const API_BASE = "http://localhost:5000/api/medicines";

export const getMedicines = () => axios.get(API_BASE);
export const createMedicine = (data) => axios.post(API_BASE, data);
export const updateMedicine = (id, data) =>
  axios.put(`${API_BASE}/${id}`, data);
export const deleteMedicine = (id) => axios.delete(`${API_BASE}/${id}`);
