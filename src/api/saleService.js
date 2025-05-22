import axios from "axios";

const API_BASE = "http://localhost:5000/api/sales";

export const getSales = () => axios.get(API_BASE);
export const createSale = (data) => axios.post(API_BASE, data);
export const updateSale = (id, data) => axios.put(`${API_BASE}/${id}`, data);
export const deleteSale = (id) => axios.delete(`${API_BASE}/${id}`);
