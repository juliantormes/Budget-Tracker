import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosApi';

export function useFetchingFinancialData(year, month) {
    const [data, setData] = useState({ incomes: [], expenses: [], creditCardExpenses: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);

        // Generate an array of months and years for the last 24 months
        const monthYearParams = [];
        for (let i = 0; i < 24; i++) {
            const date = new Date(year, month - 1 - i);
            monthYearParams.push({ year: date.getFullYear(), month: date.getMonth() + 1 });
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

            const combinedIncomes = [];
            const combinedExpenses = [];
            const combinedCreditCardExpenses = [];

            results.forEach(([incomeResponse, expenseResponse, creditCardResponse]) => {
                combinedIncomes.push(...incomeResponse.data);
                combinedExpenses.push(...expenseResponse.data);
                combinedCreditCardExpenses.push(...creditCardResponse.data);
            });

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
