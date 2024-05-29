import { useState, useEffect, useCallback } from 'react';
import pLimit from 'p-limit';
import { useFetchYearData } from './useFetchYearData';
import { mergeData } from '../utils/mergeData';
import {
    generateVibrantShades,
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

export function useFetchFinancialData(year, month) {
    const [data, setData] = useState({ incomes: [], expenses: [], creditCardExpenses: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchYearData = useFetchYearData();

    const fetchData = useCallback(async () => {
        setLoading(true);

        try {
            const limit = pLimit(5);

            const currentYearData = await fetchYearData(year);

            const maxInstallments = currentYearData.expenses.reduce((max, expense) => {
                return Math.max(max, expense.installments || 0);
            }, 0);

            const yearsToFetch = Math.ceil(maxInstallments / 12);

            let pastDataResults = [];
            if (yearsToFetch > 0) {
                const pastYears = [];
                for (let i = 1; i <= yearsToFetch; i++) {
                    pastYears.push(year - i);
                }

                const pastDataPromises = pastYears.map((y) => limit(() => fetchYearData(y)));
                pastDataResults = await Promise.all(pastDataPromises);
            }

            const allIncomes = mergeData(currentYearData.incomes, pastDataResults.flatMap(res => res.incomes || []));
            const allExpenses = mergeData(currentYearData.expenses, pastDataResults.flatMap(res => res.expenses || []));
            const allCreditCardExpenses = mergeData(currentYearData.creditCardExpenses, pastDataResults.flatMap(res => res.creditCardExpenses || []));

            setData({
                incomes: allIncomes,
                expenses: allExpenses,
                creditCardExpenses: allCreditCardExpenses,
            });

        } catch (error) {
            console.error('Failed to fetch financial data:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [year, fetchYearData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const incomeChartData = prepareIncomeChartData(data.incomes, year, month, generateVibrantShades([52, 152, 219], 10));
    const expenseChartData = prepareExpenseChartData(data.expenses.filter(expense => !expense.credit_card), year, month, generateVibrantShades([46, 204, 113], 10));
    const creditCardChartData = prepareCreditCardChartData(data.creditCardExpenses, year, month, generateVibrantShades([231, 76, 60], 10));

    const totalIncome = calculateTotalIncome(incomeChartData);
    const totalExpenses = calculateTotalExpenses(expenseChartData);
    const totalCreditCardDebt = calculateTotalCreditCardDebt(creditCardChartData);
    const net = calculateNet(totalIncome, totalExpenses, totalCreditCardDebt);
    const percentages = calculatePercentages(totalIncome, totalExpenses, totalCreditCardDebt, net);
    const barChartData = prepareBarChartData(percentages);

    return { 
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
    };
}
