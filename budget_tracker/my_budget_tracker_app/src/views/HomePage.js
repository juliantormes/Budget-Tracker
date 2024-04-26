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
    const { logout } = useAuth();  // Using the useAuth hook for authentication actions
    const searchParams = new URLSearchParams(location.search);
    const year = parseInt(searchParams.get('year'), 10) || new Date().getFullYear();
    const month = parseInt(searchParams.get('month'), 10) || new Date().getMonth() + 1;
    
    const { data, loading, error } = useFetchingFinancialData(year, month);
    const { goToPreviousMonth, goToNextMonth } = useDateNavigation(year, month);  // Navigation hook for moving through months

    const prepareChartData = (dataItems) => {
        if (!dataItems) {
            console.error('No data available');
            return { labels: [], datasets: [] };
        }
        const sumsByCategory = {};
        if (Array.isArray(dataItems)) {
            dataItems.forEach(item => {
                const category = item.category_name || 'Undefined Category';
                sumsByCategory[category] = (sumsByCategory[category] || 0) + parseFloat(item.amount || 0);
            });
        } else if (typeof dataItems === 'object') {
            Object.keys(dataItems).forEach(month => {
                sumsByCategory[month] = dataItems[month];
            });
        }

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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading data.</div>;

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
                    <Chart data={prepareChartData(data.monthlyCreditCardExpenses)} options={ChartOptions} />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
