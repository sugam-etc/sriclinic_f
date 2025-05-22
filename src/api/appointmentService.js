import axios from "axios";
import { API } from "../config";

const API_BASE = `${API}appointments`;

export const getAppointments = () => axios.get(API_BASE);
export const createAppointment = (data) => axios.post(API_BASE, data);
export const updateAppointment = (id, data) =>
  axios.put(`${API_BASE}/${id}`, data);
export const deleteAppointment = (id) => axios.delete(`${API_BASE}/${id}`);
