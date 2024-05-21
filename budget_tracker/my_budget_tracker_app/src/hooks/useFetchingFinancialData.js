import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosApi';
import pLimit from 'p-limit';

const cache = {
    incomes: {},
    expenses: {},
    creditCardExpenses: {},
};

export function useFetchingFinancialData(year, month) {
    const [data, setData] = useState({ incomes: [], expenses: [], creditCardExpenses: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const yearParams = [];

        // Calculate years for the next 20 years
        for (let i = 0; i < 20; i++) {
            const currentYear = year - i;
            if (!cache.incomes[currentYear] || !cache.expenses[currentYear] || !cache.creditCardExpenses[currentYear]) {
                yearParams.push(currentYear);
            }
        }

        try {
            const limit = pLimit(5); // Limit concurrency to 5 requests at a time

            const promises = yearParams.map(currentYear => {
                return limit(async () => {
                    const params = new URLSearchParams({ year: currentYear }).toString();
                    const [incomeResponse, expenseResponse, creditCardResponse] = await Promise.all([
                        axiosInstance.get(`incomes/?${params}`),
                        axiosInstance.get(`expenses/?${params}`),
                        axiosInstance.get(`credit-card-expenses/?${params}`),
                    ]);

                    cache.incomes[currentYear] = incomeResponse.data.filter(income => !income.is_recurring);
                    cache.expenses[currentYear] = expenseResponse.data.filter(expense => !expense.is_recurring);
                    cache.creditCardExpenses[currentYear] = creditCardResponse.data;

                    return [incomeResponse.data, expenseResponse.data, creditCardResponse.data];
                });
            });

            await Promise.all(promises);

            // Fetch current month's recurring incomes and expenses separately
            const [currentIncomeResponse, currentExpenseResponse] = await Promise.all([
                axiosInstance.get(`incomes/?year=${year}&month=${month}&is_recurring=true`),
                axiosInstance.get(`expenses/?year=${year}&month=${month}&is_recurring=true`)
            ]);

            const uniqueIncomes = new Map();
            const uniqueExpenses = new Map();

            // Add non-recurring items to unique sets to avoid duplication
            Object.values(cache.incomes).flat().forEach(income => {
                if (!uniqueIncomes.has(income.id)) {
                    uniqueIncomes.set(income.id, income);
                }
            });
            Object.values(cache.expenses).flat().forEach(expense => {
                if (!uniqueExpenses.has(expense.id)) {
                    uniqueExpenses.set(expense.id, expense);
                }
            });

            // Add recurring items from current month
            currentIncomeResponse.data.forEach(income => {
                if (income.is_recurring && !uniqueIncomes.has(income.id)) {
                    uniqueIncomes.set(income.id, income);
                }
            });
            currentExpenseResponse.data.forEach(expense => {
                if (expense.is_recurring && !uniqueExpenses.has(expense.id)) {
                    uniqueExpenses.set(expense.id, expense);
                }
            });

            const combinedIncomes = Array.from(uniqueIncomes.values());
            const combinedExpenses = Array.from(uniqueExpenses.values());
            const combinedCreditCardExpenses = Object.values(cache.creditCardExpenses).flat();

            setData({
                incomes: combinedIncomes,
                expenses: combinedExpenses,
                creditCardExpenses: combinedCreditCardExpenses,
            });
        } catch (error) {
            console.error('Failed to fetch financial data:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    }, [year, month]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error };
}
