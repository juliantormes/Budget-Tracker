import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosApi';

const HomePage = () => {
  const [financialData, setFinancialData] = useState({
    incomes: [],
    expenses: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch incomes and expenses using axiosInstance
        const [incomeResponse, expenseResponse] = await Promise.all([
          axiosInstance.get('incomes/'),
          axiosInstance.get('expenses/'),
        ]);
        
        setFinancialData({
          incomes: incomeResponse.data,
          expenses: expenseResponse.data,
        });
      } catch (error) {
        console.error('Failed to fetch financial data:', error);
        // Consider handling errors more visibly in the UI if appropriate
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Financial Overview</h1>
      <h2>Incomes</h2>
      <ul>
        {financialData.incomes.map(income => (
          <li key={income.id}>{income.description} - ${income.amount}</li>
        ))}
      </ul> {/* This closing tag was missing in your provided snippet */}
      <h2>Expenses</h2>
      <ul>
        {financialData.expenses.map(expense => (
          <li key={expense.id}>{expense.description} - ${expense.amount}</li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
