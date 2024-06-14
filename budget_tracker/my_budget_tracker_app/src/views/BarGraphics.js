import React, { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import Header from '../components/Header';
import SidebarMenu from '../components/SidebarMenu';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosApi';
import '../styles/BarGraphics.css';
import { barChartOptions, prepareBarChartData, calculateTotalIncome, calculateTotalExpenses, calculateTotalCreditCardDebt, calculateNet, calculatePercentages } from '../utils/chartUtils';

const BarGraphics = () => {
  const { logout } = useAuth();
  const [chartData, setChartData] = useState(null);
  const [incomeData, setIncomeData] = useState({ datasets: [{ data: [] }] });
  const [expenseData, setExpenseData] = useState({ datasets: [{ data: [] }] });
  const [creditCardData, setCreditCardData] = useState({ datasets: [{ data: [] }] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const incomeResponse = await axiosInstance.get('/api/incomes/');
        const expenseResponse = await axiosInstance.get('/api/expenses/');
        const creditCardResponse = await axiosInstance.get('/api/credit_cards/');
        
        setIncomeData(incomeResponse.data);
        setExpenseData(expenseResponse.data);
        setCreditCardData(creditCardResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (incomeData.datasets[0].data.length && expenseData.datasets[0].data.length && creditCardData.datasets[0].data.length) {
      const totalIncome = calculateTotalIncome(incomeData);
      const totalExpenses = calculateTotalExpenses(expenseData);
      const totalCreditCardDebt = calculateTotalCreditCardDebt(creditCardData);
      const net = calculateNet(totalIncome, totalExpenses, totalCreditCardDebt);
      const percentages = calculatePercentages(totalIncome, totalExpenses, totalCreditCardDebt, net);
      const barData = prepareBarChartData(percentages);

      setChartData(barData);
    }
  }, [incomeData, expenseData, creditCardData]);

  return (
    <div className="bar-graphics">
      <div className="sidebar-container">
        <SidebarMenu />
      </div>
      <div className="content">
        <Header logout={logout} />
        <Container>
          <Typography variant="h4" gutterBottom>Bar Graphics</Typography>
          {chartData ? (
            <Bar data={chartData} options={barChartOptions} />
          ) : (
            <Typography variant="h6" color="textSecondary">Loading...</Typography>
          )}
        </Container>
      </div>
    </div>
  );
};

export default BarGraphics;
