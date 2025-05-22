import axios from "axios";
import { API } from "../config";

const API_BASE = `${API}clients`;

export const getClients = () => axios.get(API_BASE);
export const createClient = (data) => axios.post(API_BASE, data);
export const updateClient = (id, data) => axios.put(`${API_BASE}/${id}`, data);
export const deleteClient = (id) => axios.delete(`${API_BASE}/${id}`);
