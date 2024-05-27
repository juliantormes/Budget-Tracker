import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Bar } from 'react-chartjs-2';
import Chart from '../components/Chart';

const FinancialSummary = ({
    incomeChartData,
    expenseChartData,
    creditCardChartData,
    totalIncome,
    totalExpenses,
    totalCreditCardDebt,
    pieChartOptions,
    barChartData,
    barChartOptions,
    net,
    year,
    month,
    goToPreviousMonth,
    goToNextMonth
}) => (
    <div className="financial-summary">
        <div className="date-navigation-container">
            <div className="date-navigation">
                <button onClick={goToPreviousMonth}>
                    <ArrowBackIcon />
                    <span>Previous Month</span>
                </button>
                <span>{year} - {String(month).padStart(2, '0')}</span>
                <button onClick={goToNextMonth}>
                    <span>Next Month</span>
                    <ArrowForwardIcon />
                </button>
            </div>
        </div>
        <div className="pie-charts-container">
            <div className="summary-item">
                <div className="chart-container">
                    <Chart data={incomeChartData} options={pieChartOptions} />
                </div>
                <h3>Total Incomes: ${totalIncome.toLocaleString()}</h3>
            </div>
            <div className="summary-item">
                <div className="chart-container">
                    <Chart data={expenseChartData} options={pieChartOptions} />
                </div>
                <h3>Total Expenses: ${totalExpenses.toLocaleString()}</h3>
            </div>
            <div className="summary-item">
                <div className="chart-container">
                    <Chart data={creditCardChartData} options={pieChartOptions} />
                </div>
                <h3>Total Credit Card: ${totalCreditCardDebt.toLocaleString()}</h3>
            </div>
        </div>
        <div className="bar-chart-container">
            <Bar data={barChartData} options={barChartOptions} />
        </div>
        <h3>Net: ${net.toLocaleString()}</h3>
    </div>
);

export default FinancialSummary;
