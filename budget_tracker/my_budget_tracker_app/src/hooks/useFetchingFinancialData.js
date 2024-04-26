import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosApi';

export function useFetchingFinancialData (year, month) {
    const [data, setData] = useState({ incomes: [], expenses: [], monthlyCreditCardExpenses: {} });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const params = new URLSearchParams({ year, month }).toString();
            try {
                const [incomeResponse, expenseResponse, creditCardExpenseResponse] = await Promise.all([
                    axiosInstance.get(`incomes/?${params}`),
                    axiosInstance.get(`expenses/?${params}`),
                    axiosInstance.get(`credit-card-expenses/?${params}`)
                ]);
  
                setData({
                    incomes: incomeResponse.data,
                    expenses: expenseResponse.data,
                    monthlyCreditCardExpenses: creditCardExpenseResponse.data
                });
            } catch (error) {
                console.error('Failed to fetch financial data:', error);
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [year, month]);

    return { data, loading, error };
}
