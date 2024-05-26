import { useCallback } from 'react';
import axiosInstance from '../api/axiosApi';

export function useFetchYearData() {
    return useCallback(async (year) => {
        const params = new URLSearchParams({ year, include_recurring: true }).toString();
        const [incomeResponse, expenseResponse, creditCardResponse] = await Promise.all([
            axiosInstance.get(`incomes/?${params}`),
            axiosInstance.get(`expenses/?${params}`),
            axiosInstance.get(`credit-card-expenses/?${params}`),
        ]);

        return {
            incomes: incomeResponse.data,
            expenses: expenseResponse.data,
            creditCardExpenses: creditCardResponse.data,
        };
    }, []);
}
