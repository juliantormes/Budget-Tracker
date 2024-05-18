import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosApi';

export function useFetchingFinancialData(year, month) {
    const [data, setData] = useState({ incomes: [], expenses: [], creditCardExpenses: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log(`useFetchingFinancialData hook: mounted/updated - year: ${year}, month: ${month}`);

        const fetchData = async () => {
            setLoading(true);
            const params = new URLSearchParams({ year, month }).toString();
            try {
                const [incomeResponse, expenseResponse, creditCardResponse] = await Promise.all([
                    axiosInstance.get(`incomes/?${params}`),
                    axiosInstance.get(`expenses/?${params}`),
                    axiosInstance.get(`credit-card-expenses/?${params}`),
                ]);

                console.log('Credit card expenses fetched:', creditCardResponse.data);

                setData({
                    incomes: incomeResponse.data,
                    expenses: expenseResponse.data,
                    creditCardExpenses: creditCardResponse.data,
                });
            } catch (error) {
                console.error('Failed to fetch credit card expenses:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            console.log(`useFetchingFinancialData hook: cleanup - year: ${year}, month: ${month}`);
        };
    }, [year, month]);

    return { data, loading, error };
}
