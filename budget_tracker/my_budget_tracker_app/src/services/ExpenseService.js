// services/ExpenseService.js

import axios from 'axios';

const API_URL = 'http://localhost:8000/api/expenses/';

export const fetchExpenses = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    throw error;
  }
};
