import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosApi';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import '../styles/HomePage.css';
import { Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Registering components for ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Chart options as per your original setup
const pieChartOptions = {
  plugins: {
    tooltip: {
      callbacks: {
        label: function(context) {
          const label = context.label || '';
          const value = context.parsed;
          return `${label}: $${value.toLocaleString()}`;
        }
      }
    }
  }
};

const HomePage = () => {
  const [data, setData] = useState({
    incomes: [],
    expenses: [],
    creditCardExpenses: [],
    date: new Date(),
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData(data.date);
  }, [data.date]);

  // Fetch financial data from the API
  const fetchData = async (currentDate) => {
    const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');

    try {
      const incomeResponse = await axiosInstance.get(`incomes/?start_date=${start}&end_date=${end}`);
      const expenseResponse = await axiosInstance.get(`expenses/?start_date=${start}&end_date=${end}`);
      // Assume you have an endpoint for credit card expenses
      // const creditCardResponse = await ...

      setData({
        ...data,
        incomes: incomeResponse.data,
        expenses: expenseResponse.data,
        // creditCardExpenses: creditCardResponse.data, // Uncomment when the endpoint is ready
      });
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
    }
  };

  // Logout the user and navigate to login page
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Navigate to previous month's data
  const handlePrevMonth = () => {
    setData({
      ...data,
      date: subMonths(data.date, 1),
    });
  };

  // Navigate to next month's data
  const handleNextMonth = () => {
    setData({
      ...data,
      date: addMonths(data.date, 1),
    });
  };

  // Prepare chart data for the Pie components
  const incomeChartData = {
    labels: data.incomes.map(item => item.category),
    datasets: [{
      label: 'Income',
      data: data.incomes.map(item => item.amount),
      backgroundColor: ['#7293cb', '#e1974c', '#84ba5b', '#d35e60', '#808585'],
    }],
  };

  const expenseChartData = {
    labels: data.expenses.map(item => item.category),
    datasets: [{
      label: 'Expenses',
      data: data.expenses.map(item => item.amount),
      backgroundColor: ['#6b4c9a', '#f28e2b', '#59a14f', '#edc948', '#b07aa1'],
    }],
  };

  // Assuming you will set the credit card chart data similarly
  // const creditCardChartData = { ... };

  return (
    <div className="homepage">
      <h1>Financial Overview for {format(data.date, 'MMMM yyyy')}</h1>
      <button onClick={handlePrevMonth}>Previous Month</button>
      <button onClick={handleNextMonth}>Next Month</button>
      <header className="homepage-header">
        <h1>Budget Tracker</h1>
        <div className="date-navigation">
          {/* Date navigation if needed */}
        </div>
        <button className="logout-button" onClick={handleLogout}>LOGOUT</button>
      </header>
      
      <div className="financial-summary">
        <h2>Financial Summary</h2>
        {data.incomes.length > 0 && <Pie data={incomeChartData} options={pieChartOptions} />}
        {data.expenses.length > 0 && <Pie data={expenseChartData} options={pieChartOptions} />}
        {/* Uncomment and use similar condition for credit card data */}
        {/* {data.creditCardExpenses.length > 0 && <Pie data={creditCardChartData} options={pieChartOptions} />} */}
      </div>
      
      <div className="charts">
        {/* Additional charts can be included here */}
      </div>

      <nav className="navigation">
        {/* Navigation links can go here */}
      </nav>
    </div>
  );
};

export default HomePage;
