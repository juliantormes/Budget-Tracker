import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../hooks/useAuth';
import SidebarMenu from '../components/SidebarMenu';
import FinancialSummary from '../components/FinancialSummary';
import { useDateNavigation } from '../hooks/useDateNavigation';
import { useFetchFinancialData } from '../hooks/useFetchFinancialData';
import '../styles/HomePage.css';

const HomePage = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const year = useMemo(() => parseInt(searchParams.get('year'), 10) || new Date().getFullYear(), [searchParams]);
    const month = useMemo(() => parseInt(searchParams.get('month'), 10) || new Date().getMonth() + 1, [searchParams]);

    const { goToPreviousMonth, goToNextMonth } = useDateNavigation(year, month);
    const {
        data,
        loading,
        error,
        incomeChartData,
        expenseChartData,
        creditCardChartData,
        totalIncome,
        totalExpenses,
        totalCreditCardDebt,
        net,
        barChartData
    } = useFetchFinancialData(year, month);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading data: {error.message}</div>;

    return (
        <div className="homepage">
            <div className="sidebar-container">
                <SidebarMenu />
            </div>
            <div className="content">
                <Header logout={logout} />
                <FinancialSummary
                    incomeChartData={incomeChartData}
                    expenseChartData={expenseChartData}
                    creditCardChartData={creditCardChartData}
                    totalIncome={totalIncome}
                    totalExpenses={totalExpenses}
                    totalCreditCardDebt={totalCreditCardDebt}
                    barChartData={barChartData}
                    net={net}
                    year={year}
                    month={month}
                    goToPreviousMonth={goToPreviousMonth}
                    goToNextMonth={goToNextMonth}
                />
            </div>
        </div>
    );
};

export default React.memo(HomePage);
