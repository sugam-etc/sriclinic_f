import axios from "axios";

import { API } from "../config";

const API_BASE = `${API}medicines`;

export const getMedicines = () => axios.get(API_BASE);
export const createMedicine = (data) => axios.post(API_BASE, data);
export const updateMedicine = (id, data) =>
  axios.put(`${API_BASE}/${id}`, data);
export const deleteMedicine = (id) => axios.delete(`${API_BASE}/${id}`);
