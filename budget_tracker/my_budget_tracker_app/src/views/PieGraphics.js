import React, { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import Header from '../components/Header';
import SidebarMenu from '../components/SidebarMenu';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosApi';
import '../styles/PieGraphics.css';
import { generateVibrantShades, prepareIncomeChartData, prepareExpenseChartData, prepareCreditCardChartData, pieChartOptions } from '../utils/chartUtils';

const PieGraphics = () => {
  const { logout } = useAuth();
  const [incomeChartData, setIncomeChartData] = useState(null);
  const [expenseChartData, setExpenseChartData] = useState(null);
  const [creditCardChartData, setCreditCardChartData] = useState(null);
  const [year] = useState(new Date().getFullYear());
  const [month] = useState(new Date().getMonth() + 1); // Months are zero-indexed in JavaScript

  useEffect(() => {
    const fetchData = async () => {
      try {
        const incomeResponse = await axiosInstance.get('/api/incomes/');
        const expenseResponse = await axiosInstance.get('/api/expenses/');
        const creditCardResponse = await axiosInstance.get('/api/credit_cards/');

        const shades = generateVibrantShades([34, 98, 177], 10);

        const incomeData = prepareIncomeChartData(incomeResponse.data, year, month, shades);
        const expenseData = prepareExpenseChartData(expenseResponse.data, year, month, shades);
        const creditCardData = prepareCreditCardChartData(creditCardResponse.data, year, month, shades);

        setIncomeChartData(incomeData);
        setExpenseChartData(expenseData);
        setCreditCardChartData(creditCardData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [year, month]);

  return (
    <div className="pie-graphics">
      <div className="sidebar-container">
        <SidebarMenu />
      </div>
      <div className="content">
        <Header logout={logout} />
        <Container>
          <Typography variant="h4" gutterBottom>Pie Graphics</Typography>
          <Typography variant="h6" gutterBottom>Income Distribution</Typography>
          {incomeChartData ? (
            <Pie data={incomeChartData} options={pieChartOptions} />
          ) : (
            <Typography variant="h6" color="textSecondary">Loading...</Typography>
          )}
          <Typography variant="h6" gutterBottom>Expense Distribution</Typography>
          {expenseChartData ? (
            <Pie data={expenseChartData} options={pieChartOptions} />
          ) : (
            <Typography variant="h6" color="textSecondary">Loading...</Typography>
          )}
          <Typography variant="h6" gutterBottom>Credit Card Distribution</Typography>
          {creditCardChartData ? (
            <Pie data={creditCardChartData} options={pieChartOptions} />
          ) : (
            <Typography variant="h6" color="textSecondary">Loading...</Typography>
          )}
        </Container>
      </div>
    </div>
  );
};

export default PieGraphics;
