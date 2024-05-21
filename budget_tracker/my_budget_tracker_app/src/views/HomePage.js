import React, { useMemo } from 'react';
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

    const prepareIncomeChartData = (incomes, year, month) => {
        const formattedMonth = `${year}-${String(month).padStart(2, '0')}`;
        // Filter non-recurring incomes for the current month
        const nonRecurringIncomes = incomes.filter(income => {
            const incomeDate = new Date(income.date);
            const incomeMonth = `${incomeDate.getFullYear()}-${String(incomeDate.getMonth() + 1).padStart(2, '0')}`;
            return !income.is_recurring && incomeMonth === formattedMonth;
        });

        // Filter recurring incomes
        const recurringIncomes = incomes.filter(income => income.is_recurring);

        // Combine non-recurring and recurring incomes, ensuring recurring incomes are only added once per month
        const processedIncomes = [...nonRecurringIncomes, ...recurringIncomes];

        const sumsByCategory = processedIncomes.reduce((acc, income) => {
            const category = income.category_name || 'Undefined Category';
            acc[category] = (acc[category] || 0) + parseFloat(income.amount || 0);
            return acc;
        }, {});

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

    const prepareExpenseChartData = (expenses, year, month) => {
        const formattedMonth = `${year}-${String(month).padStart(2, '0')}`;

        console.log('all',expenses);

        // Filter non-recurring expenses for the current month
        const nonRecurringExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            const expenseMonth = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
            return !expense.is_recurring && expenseMonth === formattedMonth;
        });
        console.log('Non recurring',nonRecurringExpenses);

        // Filter recurring expenses
        const recurringExpenses = expenses.filter(expense => expense.is_recurring);

        console.log('recurring',recurringExpenses);

        // Combine non-recurring and recurring expenses, ensuring recurring expenses are only added once per month
        const processedExpenses = [...nonRecurringExpenses, ...recurringExpenses];
        console.log('processed',processedExpenses);

        const sumsByCategory = processedExpenses.reduce((acc, expense) => {
            const category = expense.category_name || 'Undefined Category';
            acc[category] = (acc[category] || 0) + parseFloat(expense.amount || 0);
            return acc;
        }, {});

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

    const prepareCreditCardChartData = (expenses, year, month) => {
        const formattedMonth = `${year}-${String(month).padStart(2, '0')}`;

        // Process installments and distribute them across the months based on the closing day logic
        const processedExpenses = [];
        expenses.forEach(expense => {
            const expenseDate = new Date(expense.date);
            const closingDay = expense.credit_card.close_card_day;
            const surchargeRate = parseFloat(expense.surcharge || 0) / 100;
            const totalAmountWithSurcharge = parseFloat(expense.amount) * (1 + surchargeRate);
            const amountPerInstallment = totalAmountWithSurcharge / expense.installments;

            let startMonth;
            if (expenseDate.getDate() <= closingDay) {
                startMonth = new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 1, 1); // Next month
            } else {
                startMonth = new Date(expenseDate.getFullYear(), expenseDate.getMonth() + 2, 1); // Month after next
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
                processedExpenses.push({
                    ...expense,
                    month: formattedMonth,
                    amount: totalAmountWithSurcharge,
                });
            }
        });

        const filteredExpenses = processedExpenses.filter(expense => expense.month === formattedMonth);

        const chartData = filteredExpenses.reduce((acc, expense) => {
            const categoryIndex = acc.labels.indexOf(expense.category_name);
            if (categoryIndex === -1) {
                acc.labels.push(expense.category_name);
                acc.data.push(expense.amount);
            } else {
                acc.data[categoryIndex] += expense.amount;
            }
            return acc;
        }, { labels: [], data: [] });

        return {
            labels: chartData.labels,
            datasets: [{
                label: 'Credit Card Expenses',
                data: chartData.data,
                backgroundColor: ['#ffc107', '#17a2b8', '#28a745', '#dc3545', '#6c757d'],
                borderColor: ['#4b4b4b']
            }]
        };
    };

    const incomeChartData = useMemo(() => prepareIncomeChartData(data.incomes, year, month), [data.incomes, year, month]);
    const expenseChartData = useMemo(() => prepareExpenseChartData(data.expenses.filter(expense => !expense.credit_card), year, month), [data.expenses, year, month]);
    const creditCardChartData = useMemo(() => prepareCreditCardChartData(data.creditCardExpenses, year, month), [data.creditCardExpenses, year, month]);

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
