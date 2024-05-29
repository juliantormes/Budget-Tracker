import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Bar } from 'react-chartjs-2';
import Chart from '../components/Chart';
import { pieChartOptions, barChartOptions } from '../utils/chartUtils';

const FinancialSummary = ({
    incomeChartData,
    expenseChartData,
    creditCardChartData,
    totalIncome = 0,
    totalExpenses = 0,
    totalCreditCardDebt = 0,
    net = 0,
    barChartData,
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
            <SummaryItem title="Total Incomes" amount={totalIncome} data={incomeChartData} options={pieChartOptions} />
            <SummaryItem title="Total Expenses" amount={totalExpenses} data={expenseChartData} options={pieChartOptions} />
            <SummaryItem title="Total Credit Card" amount={totalCreditCardDebt} data={creditCardChartData} options={pieChartOptions} />
        </div>
        <div className="bar-chart-container">
            <Bar data={barChartData} options={barChartOptions} />
        </div>
        <h3>Net: ${net.toLocaleString()}</h3>
    </div>
);

const SummaryItem = ({ title, amount, data, options }) => (
    <div className="summary-item">
        <div className="chart-container">
            <Chart data={data} options={options} />
        </div>
        <h3>{title}: ${amount.toLocaleString()}</h3>
    </div>
);

export default FinancialSummary;
