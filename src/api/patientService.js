import axios from "axios";

const API_BASE = "http://localhost:5000/api/patients";

export const getPatients = () => axios.get(API_BASE);
export const createPatient = (data) => axios.post(API_BASE, data);
export const updatePatient = (id, data) => axios.put(`${API_BASE}/${id}`, data);
export const deletePatient = (id) => axios.delete(`${API_BASE}/${id}`);
