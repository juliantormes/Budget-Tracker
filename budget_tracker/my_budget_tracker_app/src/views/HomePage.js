import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Chart from '../components/Chart';
import { useFetchingFinancialData } from '../hooks/useFetchingFinancialData';
import { useAuth } from '../hooks/useAuth';
import { useDateNavigation } from '../hooks/useDateNavigation';
import '../styles/HomePage.css';

const HomePage = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const searchParams = new URLSearchParams(location.search);
    const year = parseInt(searchParams.get('year'), 10) || new Date().getFullYear();
    const month = parseInt(searchParams.get('month'), 10) || new Date().getMonth() + 1;
    const { data, loading, error } = useFetchingFinancialData(year, month);
    const { goToPreviousMonth, goToNextMonth } = useDateNavigation(year, month);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading data: {error.message}</div>;

    const prepareIncomeChartData = (dataItems) => {
        if (!dataItems || !dataItems.length) {
            console.error('No data available');
            return { labels: [], datasets: [] };
        }
    
        const sumsByCategory = {};
        dataItems.forEach(item => {
            const category = item.category_name || 'Undefined Category';
            sumsByCategory[category] = (sumsByCategory[category] || 0) + parseFloat(item.amount || 0);
        });
    
        const labels = Object.keys(sumsByCategory);
        const data = Object.values(sumsByCategory);
    
        return {
            labels,
            datasets: [{
                label: 'Incomes',
                data,
                backgroundColor: ['#7293cb', '#e1974c', '#84ba5b', '#d35e60', '#808585'],
                borderColor: ['#4b4b4b']
            }]
        };
    };
    
    const prepareExpenseChartData = (dataItems) => {
        if (!dataItems || !dataItems.length) {
            console.error('No data available');
            return { labels: [], datasets: [] };
        }
    
        const sumsByCategory = {};
        dataItems.forEach(item => {
            const category = item.category_name || 'Undefined Category';
            sumsByCategory[category] = (sumsByCategory[category] || 0) + parseFloat(item.amount || 0);
        });
    
        const labels = Object.keys(sumsByCategory);
        const data = Object.values(sumsByCategory);
    
        return {
            labels,
            datasets: [{
                label: 'Expenses',
                data,
                backgroundColor: ['#7293cb', '#e1974c', '#84ba5b', '#d35e60', '#808585'],
                borderColor: ['#4b4b4b']
            }]
        };
    };
    
    const prepareCreditCardChartData = (expenses) => {
        if (!expenses || !expenses.length) {
            console.error('No credit card expenses available');
            return { labels: [], datasets: [] };
        }
    
        const sumsByCategory = {};
        expenses.forEach(expense => {
            const category = expense.category_name || 'Undefined Category';
            const surchargeRate = parseFloat(expense.surcharge || 0) / 100;
            const totalAmountWithSurcharge = parseFloat(expense.amount) * (1 + surchargeRate);
            sumsByCategory[category] = (sumsByCategory[category] || 0) + totalAmountWithSurcharge;
        });
    
        const labels = Object.keys(sumsByCategory);
        const data = Object.values(sumsByCategory);
    
        return {
            labels,
            datasets: [{
                label: 'Credit Card Expenses',
                data,
                backgroundColor: ['#ffc107', '#17a2b8', '#28a745', '#dc3545', '#6c757d'],
                borderColor: ['#4b4b4b']
            }]
        };
    };
    const incomeChartData = prepareIncomeChartData(data.incomes);
    const expenseChartData = prepareExpenseChartData(data.expenses.filter(expense => !expense.credit_card));
    const creditCardChartData = prepareCreditCardChartData(data.creditCardExpenses);

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

    return (
        <div className="homepage">
            <Header 
                year={year} 
                month={month} 
                onLogout={logout} 
                onPrevMonth={goToPreviousMonth} 
                onNextMonth={goToNextMonth}
            />
            <div className="financial-summary">
                <div className="pie-chart-container">
                    <Chart data={incomeChartData} options={ChartOptions} />
                </div>
                <div className="pie-chart-container">
                    <Chart data={expenseChartData} options={ChartOptions} />
                </div>
                <div className="pie-chart-container">
                    <Chart data={creditCardChartData} options={ChartOptions} />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
