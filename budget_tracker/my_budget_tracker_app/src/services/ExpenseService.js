// services/ExpenseService.js
import axiosInstance from '../api/axiosApi';  // Adjust the path based on your file structure

const API_URL = 'expenses/';  // Since baseURL is set in axiosApi, you only need the endpoint

export const fetchExpenses = async () => {
  try {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    throw error;
  }
};
