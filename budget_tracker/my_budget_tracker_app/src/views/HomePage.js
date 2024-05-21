import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Chart from '../components/Chart';
import { useFetchingFinancialData } from '../hooks/useFetchingFinancialData';
import { useAuth } from '../hooks/useAuth';
import { useDateNavigation } from '../hooks/useDateNavigation';
import '../styles/HomePage.css';

// Utility function to generate shades of a base color
const generateShades = (baseColor, numOfShades) => {
    const shades = [];
    for (let i = 0; i < numOfShades; i++) {
        const shade = `rgba(${baseColor[0]}, ${baseColor[1]}, ${baseColor[2]}, ${(i + 1) / numOfShades})`;
        shades.push(shade);
    }
    return shades;
};

const blueShades = generateShades([52, 152, 219], 10); // Blue shades for income
const greenShades = generateShades([46, 204, 113], 10); // Green shades for expenses
const redShades = generateShades([231, 76, 60], 10); // Red shades for credit cards

const generateColorMap = (labels, shades) => {
    const colorMap = {};
    labels.forEach((label, index) => {
        colorMap[label] = shades[index % shades.length];
    });
    return colorMap;
};

const prepareIncomeChartData = (incomes, year, month) => {
    const formattedMonth = `${year}-${String(month).padStart(2, '0')}`;
    const nonRecurringIncomes = incomes.filter(income => {
        const incomeDate = new Date(income.date);
        const incomeMonth = `${incomeDate.getFullYear()}-${String(incomeDate.getMonth() + 1).padStart(2, '0')}`;
        return !income.is_recurring && incomeMonth === formattedMonth;
    });

    const recurringIncomes = incomes.filter(income => {
        const incomeDate = new Date(income.date);
        const incomeMonth = `${incomeDate.getFullYear()}-${String(incomeDate.getMonth() + 1).padStart(2, '0')}`;
        return income.is_recurring && incomeMonth <= formattedMonth;
    }).map(income => ({
        ...income,
        amount: parseFloat(income.amount)
    }));

    const processedIncomes = [...nonRecurringIncomes, ...recurringIncomes];
    const sumsByCategory = processedIncomes.reduce((acc, income) => {
        const category = income.category_name || 'Undefined Category';
        acc[category] = (acc[category] || 0) + parseFloat(income.amount || 0);
        return acc;
    }, {});

    const labels = Object.keys(sumsByCategory);
    const data = Object.values(sumsByCategory);
    const colorMap = generateColorMap(labels, blueShades);

    return {
        labels,
        datasets: [{
            label: 'Incomes',
            data,
            backgroundColor: labels.map(label => colorMap[label]),
            borderColor: ['#4b4b4b']
        }]
    };
};

const prepareExpenseChartData = (expenses, year, month) => {
    const formattedMonth = `${year}-${String(month).padStart(2, '0')}`;
    const nonRecurringExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const expenseMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
        return !expense.is_recurring && expenseMonth === formattedMonth;
    });

    const recurringExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const expenseMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
        return expense.is_recurring && expenseMonth <= formattedMonth;
    }).map(expense => ({
        ...expense,
        amount: parseFloat(expense.amount)
    }));

    const processedExpenses = [...nonRecurringExpenses, ...recurringExpenses];
    const sumsByCategory = processedExpenses.reduce((acc, expense) => {
        const category = expense.category_name || 'Undefined Category';
        acc[category] = (acc[category] || 0) + parseFloat(expense.amount || 0);
        return acc;
    }, {});

    const labels = Object.keys(sumsByCategory);
    const data = Object.values(sumsByCategory);
    const colorMap = generateColorMap(labels, greenShades);

    return {
        labels,
        datasets: [{
            label: 'Expenses',
            data,
            backgroundColor: labels.map(label => colorMap[label]),
            borderColor: ['#4b4b4b']
        }]
    };
};

const prepareCreditCardChartData = (expenses, year, month) => {
    const formattedMonth = `${year}-${String(month).padStart(2, '0')}`;
    const processedExpenses = [];

    expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        const closingDay = expense.credit_card.close_card_day;
        const surchargeRate = parseFloat(expense.surcharge || 0) / 100;
        const totalAmountWithSurcharge = parseFloat(expense.amount) * (1 + surchargeRate);
        const amountPerInstallment = totalAmountWithSurcharge / expense.installments;

        let startMonth;
        if (expenseDate.getDate() <= closingDay) {
            startMonth = new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 1, 1);
        } else {
            startMonth = new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 2, 1);
        }

        if (expense.installments > 1) {
            for (let i = 0; i < expense.installments; i++) {
                const installmentMonth = new Date(startMonth);
                installmentMonth.setMonth(startMonth.getMonth() + i);
                const formattedInstallmentMonth = `${installmentMonth.getFullYear()}-${String(installmentMonth.getMonth() + 1).padStart(2, '0')}`;
                processedExpenses.push({
                    ...expense,
                    month: formattedInstallmentMonth,
                    amount: amountPerInstallment,
                });
            }
        } else {
            if (expense.is_recurring) {
                const expenseMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
                if (expenseMonth <= formattedMonth) {
                    processedExpenses.push({
                        ...expense,
                        month: formattedMonth,
                        amount: totalAmountWithSurcharge,
                    });
                }
            } else {
                processedExpenses.push({
                    ...expense,
                    month: formattedMonth,
                    amount: totalAmountWithSurcharge,
                });
            }
        }
    });

    const filteredExpenses = processedExpenses.filter(expense => expense.month === formattedMonth);
    const chartData = filteredExpenses.reduce((acc, expense) => {
        const label = `${expense.credit_card.brand} ending in ${expense.credit_card.last_four_digits}`;
        const categoryIndex = acc.labels.indexOf(label);
        if (categoryIndex === -1) {
            acc.labels.push(label);
            acc.data.push(expense.amount);
        } else {
            acc.data[categoryIndex] += expense.amount;
        }
        return acc;
    }, { labels: [], data: [] });

    const colorMap = generateColorMap(chartData.labels, redShades);

    return {
        labels: chartData.labels,
        datasets: [{
            label: 'Credit Card Expenses',
            data: chartData.data,
            backgroundColor: chartData.labels.map(label => colorMap[label]),
            borderColor: ['#4b4b4b']
        }]
    };
};

const HomePage = () => {
    const location = useLocation();
    const { logout } = useAuth();
    const searchParams = new URLSearchParams(location.search);
    const year = parseInt(searchParams.get('year'), 10) || new Date().getFullYear();
    const month = parseInt(searchParams.get('month'), 10) || new Date().getMonth() + 1;
    const { data, loading, error } = useFetchingFinancialData(year, month);
    const { goToPreviousMonth, goToNextMonth } = useDateNavigation(year, month);

    const incomeChartData = useMemo(() => prepareIncomeChartData(data.incomes, year, month), [data.incomes, year, month]);
    const expenseChartData = useMemo(() => prepareExpenseChartData(data.expenses.filter(expense => !expense.credit_card), year, month), [data.expenses, year, month]);
    const creditCardChartData = useMemo(() => prepareCreditCardChartData(data.creditCardExpenses, year, month), [data.creditCardExpenses, year, month]);

    const ChartOptions = {
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading data: {error.message}</div>;

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
