import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosApi';

export function useCreditCardExpenses(year, month) {
    const [creditCardExpenses, setCreditCardExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const params = new URLSearchParams({ year, month }).toString();
            try {
                const response = await axiosInstance.get(`credit-card-expenses/?${params}`);
                setCreditCardExpenses(response.data || []);
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
