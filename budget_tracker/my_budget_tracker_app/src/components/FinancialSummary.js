import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
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
    year, 
    month, 
    goToPreviousMonth, 
    goToNextMonth 
}) => (
    <div className="financial-summary">
        <div className="date-navigation-container">
            <div className="date-navigation">
                <button onClick={goToPreviousMonth}>
                    <FontAwesomeIcon icon={faArrowLeft} /> Previous Month
                </button>
                <span>{year} - {String(month).padStart(2, '0')}</span>
                <button onClick={goToNextMonth}>
                    Next Month <FontAwesomeIcon icon={faArrowRight} />
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
    </div>
);

export default FinancialSummary;
