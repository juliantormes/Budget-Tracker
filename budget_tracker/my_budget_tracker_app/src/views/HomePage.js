import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDateNavigation } from '../hooks/useDateNavigation';
import { useFetchFinancialData } from '../hooks/useFetchFinancialData';
import FinancialSummary from '../components/FinancialSummary';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import Error from '../components/Error';
import '../styles/HomePage.css';

const HomePage = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const year = useMemo(() => parseInt(searchParams.get('year'), 10) || new Date().getFullYear(), [searchParams]);
    const month = useMemo(() => parseInt(searchParams.get('month'), 10) || new Date().getMonth() + 1, [searchParams]);

    const { goToPreviousMonth, goToNextMonth } = useDateNavigation(year, month);
    const {
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

    if (loading) return <Loading />;
    if (error) return <Error message={error.message} />;

    return (
        <Layout logout={logout}>
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
        </Layout>
    );
};

export default React.memo(HomePage);
