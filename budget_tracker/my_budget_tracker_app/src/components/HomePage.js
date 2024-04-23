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
  const year = parseInt(searchParams.get('year')) || new Date().getFullYear();
  const month = parseInt(searchParams.get('month')) || new Date().getMonth() + 1;

  const [data, setData] = useState({
    incomes: [],
    expenses: [],
    creditCardExpenses: [],
    monthlyCreditCardExpenses: {}
  });

  const fetchData = async (year, month) => {
    const params = new URLSearchParams({ year, month }).toString();
    
    try {
      const responses = await Promise.all([
        axiosInstance.get(`incomes/?${params}`),
        axiosInstance.get(`expenses/?${params}`),
        axiosInstance.get(`credit-card-expenses/?year=${year}&month=${month}`) // Adjust according to actual endpoint
      ]);
  
      setData({
        incomes: responses[0].data,
        expenses: responses[1].data,
        creditCardExpenses: responses[2].data,
        monthlyCreditCardExpenses: calculateCreditCardExpenses(responses[2].data)
      });
    } catch (error) {
      console.error('Failed to fetch financial data:', error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    }
  };
  const calculateCreditCardExpenses = (expenses) => {
    const monthlyExpenses = {};
  
    expenses.forEach(expense => {
      let effectiveDate = new Date(expense.date);
      const closingDay = expense.credit_card.close_card_day;
      if (effectiveDate.getDate() > closingDay) {
        effectiveDate.setMonth(effectiveDate.getMonth() + 1); // Adjust for closing day
      }
  
      const installmentCount = Math.max(expense.installments, 1); // Ensure there is at least one installment
      const surcharge = expense.surcharge || 0; // Ensure surcharge is defined
      const installmentAmount = (expense.amount + expense.amount * surcharge / 100) / installmentCount;
  
      for (let i = 0; i < installmentCount; i++) {
        const monthIndex = effectiveDate.getMonth() + 1;
        const monthKey = `${effectiveDate.getFullYear()}-${monthIndex < 10 ? `0${monthIndex}` : monthIndex}`;
        monthlyExpenses[monthKey] = (monthlyExpenses[monthKey] || 0) + installmentAmount;
        effectiveDate.setMonth(effectiveDate.getMonth() + 1);
      }
    });
  
    console.log('Monthly Credit Card Expenses:', monthlyExpenses);
    return monthlyExpenses;
  };
  
  
  
  useEffect(() => {
    fetchData(year, month);
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
    const sumsByCategory = dataItems.reduce((acc, item) => {
      const category_name = item.category_name || 'Undefined Category';
      const amount = parseFloat(item.amount); // Ensure the amount is a number
      if (!isNaN(amount)) { // Check if amount is a valid number
        if (acc[category_name]) {
          acc[category_name] += amount;
        } else {
          acc[category_name] = amount;
        }
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
  };

  const prepareCreditCardChartData = () => {
    if (!data.monthlyCreditCardExpenses || Object.keys(data.monthlyCreditCardExpenses).length === 0) {
      console.error('No credit card expense data available to display.');
      return { labels: [], datasets: [] };
    }
  
    const labels = Object.keys(data.monthlyCreditCardExpenses);
    const values = Object.values(data.monthlyCreditCardExpenses).map(value => parseFloat(value.toFixed(2))); // Ensure clean number formatting
  
    return {
      labels,
      datasets: [{
        label: 'Credit Card Expenses',
        data: values,
        backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe'],
        borderColor: ['#ff6384', '#36a2eb', '#cc65fe'],
      }],
    };
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
          <Pie data={prepareCreditCardChartData()} options={ChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
