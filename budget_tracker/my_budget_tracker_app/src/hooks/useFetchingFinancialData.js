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
                        axiosInstance.get(`incomes/?${params}&month=${month}&include_recurring=true`),
                        axiosInstance.get(`expenses/?${params}&month=${month}&include_recurring=true`),
                        axiosInstance.get(`credit-card-expenses/?${params}`),
                    ]);

                    cache.incomes[currentYear] = incomeResponse.data;
                    cache.expenses[currentYear] = expenseResponse.data;
                    cache.creditCardExpenses[currentYear] = creditCardResponse.data;

                    return [incomeResponse.data, expenseResponse.data, creditCardResponse.data];
                });
            });

            await Promise.all(promises);

            const uniqueIncomes = new Map();
            const uniqueExpenses = new Map();

            // Add items to unique sets to avoid duplication
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
