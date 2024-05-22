import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Chart from '../components/Chart';
import { Bar } from 'react-chartjs-2';
import { useFetchingFinancialData } from '../hooks/useFetchingFinancialData';
import { useAuth } from '../hooks/useAuth';
import { useDateNavigation } from '../hooks/useDateNavigation';
import NavigationBar from '../components/NavigationBar';
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

// Function to generate a consistent color mapping
const generateConsistentColorMap = (labels, shades) => {
    let colorMap = JSON.parse(localStorage.getItem('colorMap')) || {};

    labels.forEach(label => {
        if (!colorMap[label]) {
            colorMap[label] = shades[Object.keys(colorMap).length % shades.length];
        }
    });

    localStorage.setItem('colorMap', JSON.stringify(colorMap));
    return colorMap;
};

const calculateTotalIncome = (data) => {
    return data.datasets[0].data.reduce((total, value) => total + value, 0);
};

const calculateTotalExpenses = (data) => {
    return data.datasets[0].data.reduce((total, value) => total + value, 0);
};

const calculateTotalCreditCardDebt = (data) => {
    return data.datasets[0].data.reduce((total, value) => total + value, 0);
};

const calculateNet = (totalIncome, totalExpenses, totalCreditCardDebt) => {
    return totalIncome - totalExpenses - totalCreditCardDebt;
};

const calculatePercentages = (totalIncome, totalExpenses, totalCreditCardDebt, net) => {
    const cashFlowPercentage = (totalExpenses / totalIncome) * 100;
    const creditCardPercentage = (totalCreditCardDebt / totalIncome) * 100;
    const netPercentage = (net / totalIncome) * 100;
    return {
        netPercentage: netPercentage.toFixed(2),
        cashFlowPercentage: cashFlowPercentage.toFixed(2),
        creditCardPercentage: creditCardPercentage.toFixed(2),
    };
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
    const colorMap = generateConsistentColorMap(labels, blueShades);

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
    const colorMap = generateConsistentColorMap(labels, greenShades);

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

    const colorMap = generateConsistentColorMap(chartData.labels, redShades);

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

const prepareBarChartData = (percentages) => {
    return {
        labels: ['Net', 'Cash Flow', 'Credit Card'],
        datasets: [
            {
                label: 'Financial Overview (%)',
                data: [
                    percentages.netPercentage,
                    percentages.cashFlowPercentage,
                    percentages.creditCardPercentage,
                ],
                backgroundColor: ['rgba(46, 204, 113, 0.6)', 'rgba(52, 152, 219, 0.6)', 'rgba(231, 76, 60, 0.6)'],
                borderColor: ['rgba(46, 204, 113, 1)', 'rgba(52, 152, 219, 1)', 'rgba(231, 76, 60, 1)'],
                borderWidth: 1,
            },
        ],
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
        indexAxis: 'y', // For horizontal bar chart
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
        <div className="homepage">
            <Header
                year={year}
                month={month}
                onLogout={logout}
                onPrevMonth={goToPreviousMonth}
                onNextMonth={goToNextMonth}
            />
            <div className="financial-summary">
                <h2>Financial Summary</h2>
                <div className="summary-item">
                    <h3>Total Incomes: ${totalIncome.toLocaleString()}</h3>
                    <div className="pie-chart-container">
                        <Chart data={incomeChartData} options={pieChartOptions} />
                    </div>
                </div>
                <div className="summary-item">
                    <h3>Total Expenses: ${totalExpenses.toLocaleString()}</h3>
                    <div className="pie-chart-container">
                        <Chart data={expenseChartData} options={pieChartOptions} />
                    </div>
                </div>
                <div className="summary-item">
                    <h3>Total Credit Card Debt: ${totalCreditCardDebt.toLocaleString()}</h3>
                    <div className="pie-chart-container">
                        <Chart data={creditCardChartData} options={pieChartOptions} />
                    </div>
                </div>
                <div className="summary-item">
                    <h3>Net: ${net.toLocaleString()}</h3>
                </div>
                <div className="bar-chart-container">
                    <Bar data={barChartData} options={barChartOptions} />
                </div>
            </div>
            <NavigationBar />
        </div>
    );
};

export default HomePage;
