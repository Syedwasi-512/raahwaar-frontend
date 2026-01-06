// src/features/filterService.js
import axios from "axios";


const API_URL = import.meta.env.API_URL || "http://localhost:5000/api";

export const getFilters = async () => {
  try {
    const response = await axios.get(`${API_URL}/filters`);
    return response.data; // Returns { data: { genders, brands, ... } }

  } catch (error) {
    console.error("Error fetching filters:", error);
    throw error;
  }
};