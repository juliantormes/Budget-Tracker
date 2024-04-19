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
      setData(prev => ({
        ...prev,
        incomes: incomeResponse.data,
        expenses: expenseResponse.data,
      }));
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleMonthChange = (direction) => {
    setData(prev => ({
      ...prev,
      date: direction === 'prev' ? subMonths(prev.date, 1) : addMonths(prev.date, 1),
    }));
  };

  const ChartOptions = {
    aspectRatio: 1.5,
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

  const prepareChartData = (dataItems) => ({
    labels: dataItems.map(item => item.description || 'Undefined Category'),
    datasets: [{
      label: dataItems[0]?.type || 'Data',
      data: dataItems.map(item => item.amount),
      backgroundColor: ['#7293cb', '#e1974c', '#84ba5b', '#d35e60', '#808585'],
    }],
  });

  return (
    <div className="homepage">
      <h1>Financial Overview for {format(data.date, 'MMMM yyyy')}</h1>
      <button onClick={() => handleMonthChange('prev')}>Previous Month</button>
      <button onClick={() => handleMonthChange('next')}>Next Month</button>
      <div className="financial-summary">
        <div className="pie-chart-container">
          <Pie data={prepareChartData(data.incomes)} options={ChartOptions} />
        </div>
        <div className="pie-chart-container">
          <Pie data={prepareChartData(data.expenses)} options={ChartOptions} />
        </div>
        {/* Add similar container for credit card expenses if needed */}
      </div>
    </div>
  );
};

export default HomePage;
