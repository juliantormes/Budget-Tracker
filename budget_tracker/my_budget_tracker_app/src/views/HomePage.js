import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Chart from '../components/Chart';
import { useFetchingFinancialData } from '../hooks/useFetchingFinancialData';
import { useCreditCardExpenses } from '../hooks/useCreditCardExpenses';  // Import the new hook
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
    const { creditCardExpenses, loading: ccLoading, error: ccError } = useCreditCardExpenses(year, month);
    const { goToPreviousMonth, goToNextMonth } = useDateNavigation(year, month);

    const prepareChartData = (dataItems) => {
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
                label: 'Financial Data',
                data,
                backgroundColor: ['#7293cb', '#e1974c', '#84ba5b', '#d35e60', '#808585'],
                borderColor: ['#4b4b4b']
            }]
        };
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
    if (loading || ccLoading) return <div>Loading...</div>;
    if (error) return <div>Error loading data: {error.message}</div>;
    if (ccError) return <div>Error loading credit card expenses: {ccError.message}</div>;

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
                    <Chart data={prepareChartData(data.incomes)} options={ChartOptions} />
                </div>
                <div className="pie-chart-container">
                    <Chart data={prepareChartData(data.expenses)} options={ChartOptions} />
                </div>
                <div className="pie-chart-container">
                    <Chart data={prepareChartData(creditCardExpenses)} options={ChartOptions} />
                </div>
            </div>
        </div>
    );
};
export default HomePage;
