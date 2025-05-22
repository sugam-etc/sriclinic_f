// services/inventoryService.js
import axios from "axios";
import { API } from "../config";

const API_URL = `${API}inventory`;

export const getAllInventory = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const addInventoryItem = async (item) => {
  const response = await axios.post(API_URL, item);
  return response.data;
};

export const updateInventoryItem = async (id, updates) => {
  const response = await axios.put(`${API_URL}/${id}`, updates);
  return response.data;
};

export const deleteInventoryItem = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
