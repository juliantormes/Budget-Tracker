import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosApi';

export function useCreditCardExpenses(year, month) {
    const [creditCardExpenses, setCreditCardExpenses] = useState({labels: [], values: [], total: 0});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams({ year, month }).toString();
            try {
                const response = await axiosInstance.get(`credit-card-expenses/?${params}`);
                if (response.data) {
                    setCreditCardExpenses(response.data);
                } else {
                    setError('No data returned');
                }
            } catch (err) {
                console.error('Failed to fetch credit card expenses:', err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [year, month]);

    return { creditCardExpenses, loading, error };
}
