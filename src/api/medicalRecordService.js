//src/api/medicalRecordService.js
import axios from "axios";
import { API } from "../config";

const API_BASE = `${API}medical-records`;

export const getMedicalRecords = () => axios.get(API_BASE);
export const createMedicalRecord = (data) => axios.post(API_BASE, data);
export const updateMedicalRecord = (id, data) =>
  axios.put(`${API_BASE}/${id}`, data);
export const deleteMedicalRecord = (id) => axios.delete(`${API_BASE}/${id}`);
