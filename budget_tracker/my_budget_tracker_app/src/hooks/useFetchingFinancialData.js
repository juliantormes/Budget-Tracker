import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosApi';

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
        const monthYearParams = [];

        // Calculate months for the next 20 years (240 months)
        for (let i = 0; i < 240; i++) {
            const date = new Date(year, month - 1 - i);
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!cache.incomes[formattedDate]) {
                monthYearParams.push({ year: date.getFullYear(), month: date.getMonth() + 1 });
            }
        }

        try {
            const promises = monthYearParams.map(({ year, month }) => {
                const params = new URLSearchParams({ year, month }).toString();
                return Promise.all([
                    axiosInstance.get(`incomes/?${params}`),
                    axiosInstance.get(`expenses/?${params}`),
                    axiosInstance.get(`credit-card-expenses/?${params}`),
                ]);
            });

            const results = await Promise.all(promises);

            results.forEach(([incomeResponse, expenseResponse, creditCardResponse], index) => {
                const { year, month } = monthYearParams[index];
                const formattedDate = `${year}-${String(month).padStart(2, '0')}`;

                cache.incomes[formattedDate] = incomeResponse.data.filter(income => !income.is_recurring);
                cache.expenses[formattedDate] = expenseResponse.data.filter(expense => !expense.is_recurring);
                cache.creditCardExpenses[formattedDate] = creditCardResponse.data;
            });

            // Fetch current month's recurring incomes and expenses separately
            const currentMonth = `${year}-${String(month).padStart(2, '0')}`;
            const [currentIncomeResponse, currentExpenseResponse] = await Promise.all([
                axiosInstance.get(`incomes/?year=${year}&month=${month}&is_recurring=true`),
                axiosInstance.get(`expenses/?year=${year}&month=${month}&is_recurring=true`)
            ]);

            const combinedIncomes = [
                ...Object.values(cache.incomes).flat(),
                ...currentIncomeResponse.data
            ];
            const combinedExpenses = [
                ...Object.values(cache.expenses).flat(),
                ...currentExpenseResponse.data
            ];
            const combinedCreditCardExpenses = Object.values(cache.creditCardExpenses).flat();

            setData({
                incomes: combinedIncomes,
                expenses: combinedExpenses,
                creditCardExpenses: combinedCreditCardExpenses,
            });

            console.log('Fetched data:', {
                combinedIncomes,
                combinedExpenses,
                combinedCreditCardExpenses,
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
