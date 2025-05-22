import axios from "axios";

const API_BASE = "http://localhost:5000/api/suppliers";

export const getSuppliers = () => axios.get(API_BASE);
export const createSupplier = (data) => axios.post(API_BASE, data);
export const updateSupplier = (id, data) =>
  axios.put(`${API_BASE}/${id}`, data);
export const deleteSupplier = (id) => axios.delete(`${API_BASE}/${id}`);
