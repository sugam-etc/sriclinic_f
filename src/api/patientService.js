import axios from "axios";
import { API } from "../config";

const API_BASE = `${API}patients`;

export const getPatients = () => axios.get(API_BASE);
export const getPatientById = (id) => axios.get(`${API_BASE}/${id}`);
export const createPatient = (data) => axios.post(API_BASE, data);
export const updatePatient = (id, data) => axios.put(`${API_BASE}/${id}`, data);
export const deletePatient = (id) => axios.delete(`${API_BASE}/${id}`);
