import axios from "axios";

import { API } from "../config";

const API_BASE = `${API}staffs`;

export const getStaffs = () => axios.get(API_BASE);
export const createStaff = (data) => axios.post(API_BASE, data);
export const updateStaff = (id, data) => axios.put(`${API_BASE}/${id}`, data);
export const deleteStaff = (id) => axios.delete(`${API_BASE}/${id}`);
