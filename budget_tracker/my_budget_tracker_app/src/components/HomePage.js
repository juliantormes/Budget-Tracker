import React, { useEffect, useState } from 'react';
import axios from 'axios';

const HomePage = () => {
  const [financialData, setFinancialData] = useState({
    incomes: [],
    expenses: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      // Using template literals to construct the full UR
      console.log(`${process.env.REACT_APP_API_BASE_URL}incomes/`); // Temporary logL
      const incomeResponse = await axios.get('http://127.0.0.1:8000/incomes/');
      const expenseResponse = await axios.get('http://127.0.0.1:8000/expenses/');
      
      setFinancialData({
        incomes: incomeResponse.data,
        expenses: expenseResponse.data,
      });
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Render your UI components using financialData */}
    </div>
  );
};

export default HomePage;
