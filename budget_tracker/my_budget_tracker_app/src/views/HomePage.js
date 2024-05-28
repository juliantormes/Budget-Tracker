import React, { useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useFetchFinancialData } from '../hooks/useFetchFinancialData';
import { useAuth } from '../hooks/useAuth';
import SidebarMenu from '../components/SidebarMenu';
import FinancialSummary from '../components/FinancialSummary';
import {
    generateVibrantShades,
    pieChartOptions,
    barChartOptions,
    prepareBarChartData,
    prepareIncomeChartData,
    prepareExpenseChartData,
    prepareCreditCardChartData,
    calculateTotalIncome,
    calculateTotalExpenses,
    calculateTotalCreditCardDebt,
    calculateNet,
    calculatePercentages
} from '../utils/chartUtils';
import '../styles/HomePage.css';

const HomePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const year = useMemo(() => parseInt(searchParams.get('year'), 10) || new Date().getFullYear(), [searchParams]);
    const month = useMemo(() => parseInt(searchParams.get('month'), 10) || new Date().getMonth() + 1, [searchParams]);
    const { data, loading, error } = useFetchFinancialData(year, month);

    const goToPreviousMonth = useCallback(() => {
        const newDate = new Date(year, month - 1, 1);
        newDate.setMonth(newDate.getMonth() - 1);
        const newYear = newDate.getFullYear();
        const newMonth = newDate.getMonth() + 1;
        navigate(`/home?year=${newYear}&month=${newMonth}`);
    }, [year, month, navigate]);

    const goToNextMonth = useCallback(() => {
        const newDate = new Date(year, month - 1, 1);
        newDate.setMonth(newDate.getMonth() + 1);
        const newYear = newDate.getFullYear();
        const newMonth = newDate.getMonth() + 1;
        navigate(`/home?year=${newYear}&month=${newMonth}`);
    }, [year, month, navigate]);

    const incomeChartData = useMemo(() => prepareIncomeChartData(data.incomes, year, month, generateVibrantShades([52, 152, 219], 10)), [data.incomes, year, month]);
    const expenseChartData = useMemo(() => prepareExpenseChartData(data.expenses.filter(expense => !expense.credit_card), year, month, generateVibrantShades([46, 204, 113], 10)), [data.expenses, year, month]);
    const creditCardChartData = useMemo(() => prepareCreditCardChartData(data.creditCardExpenses, year, month, generateVibrantShades([231, 76, 60], 10)), [data.creditCardExpenses, year, month]);
    const totalIncome = useMemo(() => calculateTotalIncome(incomeChartData), [incomeChartData]);
    const totalExpenses = useMemo(() => calculateTotalExpenses(expenseChartData), [expenseChartData]);
    const totalCreditCardDebt = useMemo(() => calculateTotalCreditCardDebt(creditCardChartData), [creditCardChartData]);
    const net = useMemo(() => calculateNet(totalIncome, totalExpenses, totalCreditCardDebt), [totalIncome, totalExpenses, totalCreditCardDebt]);

    const percentages = useMemo(() => calculatePercentages(totalIncome, totalExpenses, totalCreditCardDebt, net), [totalIncome, totalExpenses, totalCreditCardDebt, net]);

    const barChartData = useMemo(() => prepareBarChartData(percentages), [percentages]);

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
                    pieChartOptions={pieChartOptions}
                    barChartData={barChartData}
                    barChartOptions={barChartOptions}
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
