import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { useFetchingFinancialData } from '../hooks/useFetchingFinancialData';
import { useAuth } from '../hooks/useAuth';
import { useDateNavigation } from '../hooks/useDateNavigation';
import { Sidebar, Menu, MenuItem, SubMenu, ProSidebarProvider, sidebarClasses, menuClasses } from 'react-pro-sidebar';
import FinancialSummary from '../components/FinancialSummary';
import {
    generateShades,
    calculatePercentages,
    prepareBarChartData,
    prepareIncomeChartData,
    prepareExpenseChartData,
    prepareCreditCardChartData,
    calculateTotalIncome,
    calculateTotalExpenses,
    calculateTotalCreditCardDebt,
    calculateNet
} from '../utils/chartUtils';
import '../styles/HomePage.css';

const blueShades = generateShades([52, 152, 219], 10);
const greenShades = generateShades([46, 204, 113], 10);
const redShades = generateShades([231, 76, 60], 10);

const HomePage = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const searchParams = new URLSearchParams(location.search);
    const year = parseInt(searchParams.get('year'), 10) || new Date().getFullYear();
    const month = parseInt(searchParams.get('month'), 10) || new Date().getMonth() + 1;
    const { data, loading, error } = useFetchingFinancialData(year, month);
    const { goToPreviousMonth, goToNextMonth } = useDateNavigation(year, month);

    const incomeChartData = useMemo(() => prepareIncomeChartData(data.incomes, year, month, blueShades), [data.incomes, year, month]);
    const expenseChartData = useMemo(() => prepareExpenseChartData(data.expenses.filter(expense => !expense.credit_card), year, month, greenShades), [data.expenses, year, month]);
    const creditCardChartData = useMemo(() => prepareCreditCardChartData(data.creditCardExpenses, year, month, redShades), [data.creditCardExpenses, year, month]);

    const totalIncome = useMemo(() => calculateTotalIncome(incomeChartData), [incomeChartData]);
    const totalExpenses = useMemo(() => calculateTotalExpenses(expenseChartData), [expenseChartData]);
    const totalCreditCardDebt = useMemo(() => calculateTotalCreditCardDebt(creditCardChartData), [creditCardChartData]);
    const net = useMemo(() => calculateNet(totalIncome, totalExpenses, totalCreditCardDebt), [totalIncome, totalExpenses, totalCreditCardDebt]);

    const percentages = useMemo(() => calculatePercentages(totalIncome, totalExpenses, totalCreditCardDebt, net), [totalIncome, totalExpenses, totalCreditCardDebt, net]);

    const barChartData = useMemo(() => prepareBarChartData(percentages), [percentages]);

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.label}: $${context.parsed.toLocaleString()}`;
                    }
                }
            }
        }
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.label}: ${context.raw.toLocaleString()}%`;
                    }
                }
            }
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading data: {error.message}</div>;

    return (
        <ProSidebarProvider>
            <div className="homepage">
                <div className="sidebar-container">
                    <Sidebar
                        rootStyles={{
                            [`.${sidebarClasses.container}`]: {
                                backgroundColor: '#1f2a40',
                                borderRight: 'none', // Remove the right border
                            },
                            [`.${menuClasses.subMenuContent}`]: {
                                backgroundColor: '#1f2a40', // Set the background color for the submenu
                            },
                        }}
                    >
                        <Menu
                            menuItemStyles={{
                                button: ({ level, active, disabled }) => {
                                    if (level === 0) {
                                        return {
                                            color: '#ffffff', // Ensure titles are always visible
                                            backgroundColor: active ? '#2c3e50' : undefined, // Active state
                                            '&:hover': {
                                                backgroundColor: '#2c3e50', // Hover state background
                                                color: '#ffffff', // Hover state text color
                                            },
                                        };
                                    }
                                    return {
                                        color: '#ffffff', // Ensure submenu items are always visible
                                        backgroundColor: active ? '#357ABD' : '#1f2a40', // Set background color for submenu items
                                        '&:hover': {
                                            backgroundColor: '#357ABD', // Hover state background for submenu items
                                            color: '#ffffff', // Hover state text color for submenu items
                                        },
                                    };
                                },
                            }}
                        >
                            <MenuItem> Username </MenuItem>
                            <SubMenu label="Expenses">
                                <MenuItem>View Expenses</MenuItem>
                                <MenuItem>Add Expenses</MenuItem>
                                <MenuItem>View Expense Category</MenuItem>
                                <MenuItem>Add Expense Category</MenuItem>
                            </SubMenu>
                            <SubMenu label="Incomes">
                                <MenuItem>View Incomes</MenuItem>
                                <MenuItem>Add Incomes</MenuItem>
                                <MenuItem>View Income Category</MenuItem>
                                <MenuItem>Add Income Category</MenuItem>
                            </SubMenu>
                            <SubMenu label="Credit Card">
                                <MenuItem>View Credit Card</MenuItem>
                                <MenuItem>Add Credit Card</MenuItem>
                            </SubMenu>
                            <SubMenu label="Graphics">
                                <MenuItem>Pie Graphics</MenuItem>
                                <MenuItem>Bar Graphics</MenuItem>
                            </SubMenu>
                        </Menu>
                    </Sidebar>
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
                        year={year}
                        month={month}
                        goToPreviousMonth={goToPreviousMonth}
                        goToNextMonth={goToNextMonth}
                    />
                </div>
            </div>
        </ProSidebarProvider>
    );
};

export default HomePage;