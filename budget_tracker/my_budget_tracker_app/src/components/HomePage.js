import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosApi';
import { format } from 'date-fns';
import { useNavigate, useLocation } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import '../styles/HomePage.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const year = parseInt(searchParams.get('year'), 10) || new Date().getFullYear();
  const month = parseInt(searchParams.get('month'), 10) || new Date().getMonth() + 1;

  const [data, setData] = useState({
    incomes: [],
    expenses: [],
    monthlyCreditCardExpenses: {}
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const params = new URLSearchParams({ year, month }).toString();
    
    try {
      const [incomeResponse, expenseResponse, creditCardExpenseResponse] = await Promise.all([
        axiosInstance.get(`incomes/?${params}`),
        axiosInstance.get(`expenses/?${params}`),
        axiosInstance.get(`credit-card-expenses/?year=${year}&month=${month}`)
      ]);
  
      setData({
        incomes: incomeResponse.data,
        expenses: expenseResponse.data,
        monthlyCreditCardExpenses: creditCardExpenseResponse.data
      });
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [year, month]);

  const handleMonthChange = (direction) => {
    const newDate = direction === 'prev' ? new Date(year, month - 2, 1) : new Date(year, month, 1);
    navigate(`/home?year=${newDate.getFullYear()}&month=${newDate.getMonth() + 1}`);
  };

  const ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: $${context.parsed.toLocaleString()}`;
          }
        }
      }
    }
  };

  const prepareChartData = (dataItems) => {
    if (!dataItems) {
      console.error('No data available');
      return { labels: [], datasets: [] };
    }
    
    if (Array.isArray(dataItems)) {
      const sumsByCategory = dataItems.reduce((acc, item) => {
        const category_name = item.category_name || 'Undefined Category';
        const amount = parseFloat(item.amount);
        if (!isNaN(amount)) {
          acc[category_name] = (acc[category_name] || 0) + amount;
        }
        return acc;
      }, {});
      const labels = Object.keys(sumsByCategory);
      const data = Object.values(sumsByCategory);
      return {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#7293cb', '#e1974c', '#84ba5b', '#d35e60', '#808585'],
        }],
      };
    } else if (typeof dataItems === 'object') {
      const labels = Object.keys(dataItems).sort();
      const data = labels.map(label => dataItems[label]);
      return {
        labels,
        datasets: [{
          label: 'Credit Card Expenses',
          data,
          backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe'],
          borderColor: ['#ff6384', '#36a2eb', '#cc65fe'],
        }],
      };
    } else {
      console.error('Unexpected data type:', dataItems);
      return { labels: [], datasets: [] };
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="homepage">
      <header className="homepage-header">
        <h1>Budget Tracker</h1>
        <div className="date-navigation">
          <button onClick={() => handleMonthChange('prev')}>Previous Month</button>
          <span>{format(new Date(year, month - 1, 1), 'MMMM yyyy')}</span>
          <button onClick={() => handleMonthChange('next')}>Next Month</button>
        </div>
        <button className="logout-button" onClick={() => {
          localStorage.removeItem('token');
          navigate('/login');
        }}>LOGOUT</button>
      </header>
      <div className="financial-summary">
        <div className="pie-chart-container">
          <Pie data={prepareChartData(data.incomes)} options={ChartOptions} />
        </div>
        <div className="pie-chart-container">
          <Pie data={prepareChartData(data.expenses)} options={ChartOptions} />
        </div>
        <div className="pie-chart-container">
          <h3>Credit Card Expenses</h3>
          <Pie data={prepareChartData(data.monthlyCreditCardExpenses)} options={ChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
