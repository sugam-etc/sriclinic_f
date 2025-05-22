//src/api/medicalRecordService.js
import axios from "axios";

const API_BASE = "http://localhost:5000/api/medical-records";

export const getMedicalRecords = () => axios.get(API_BASE);
export const createMedicalRecord = (data) => axios.post(API_BASE, data);
export const updateMedicalRecord = (id, data) =>
  axios.put(`${API_BASE}/${id}`, data);
export const deleteMedicalRecord = (id) => axios.delete(`${API_BASE}/${id}`);
