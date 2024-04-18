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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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

  const fetchData = async (currentDate) => {
    const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');

    try {
      const incomeResponse = await axiosInstance.get(`incomes/?start_date=${start}&end_date=${end}`);
      const expenseResponse = await axiosInstance.get(`expenses/?start_date=${start}&end_date=${end}`);
      const creditCardResponse = await axiosInstance.get(`credit-card-expenses/?start_date=${start}&end_date=${end}`);

      setData({
        ...data,
        incomes: incomeResponse.data,
        expenses: expenseResponse.data,
       creditCardExpenses: creditCardResponse.data,
      });
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handlePrevMonth = () => {
    setData({
      ...data,
      date: subMonths(data.date, 1),
    });
  };

  const handleNextMonth = () => {
    setData({
      ...data,
      date: addMonths(data.date, 1),
    });
  };

  // Prepare the chart data
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
  const creditCardChartData = {
    labels: data.creditCardExpenses.map(item => item.category),
    datasets: [{
      label: 'Credit Card',
      data: data.creditCardExpenses.map(item => item.amount),
      backgroundColor: ['#76b7b2', '#ff9da7', '#9c755f', '#bab0ac', '#d67236'],
    }],
  };

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
        <Pie data={incomeChartData} />
        <Pie data={expenseChartData} />
        <Pie data={creditCardChartData} />
      </div>
      
      <div className="charts">
        {/* Include Bar chart for Credit Card Debt etc. */}
      </div>

      <nav className="navigation">
        {/* Your navigation links here */}
      </nav>
    </div>
  );
};

export default HomePage;
