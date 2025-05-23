// src/api/loginService.js
import axios from "axios";
import { API } from "../config";

const LOGIN_URL = `${API}staffs/login`;
export const loginUser = async (userId, password) => {
  const response = await axios.post(LOGIN_URL, { userId, password });
  return response.data;
};
