import axios from "axios";

import { API } from "../config";

const API_BASE = `${API}suppliers`;

export const getSuppliers = () => axios.get(API_BASE);
export const createSupplier = (data) => axios.post(API_BASE, data);
export const updateSupplier = (id, data) =>
  axios.put(`${API_BASE}/${id}`, data);
export const deleteSupplier = (id) => axios.delete(`${API_BASE}/${id}`);
