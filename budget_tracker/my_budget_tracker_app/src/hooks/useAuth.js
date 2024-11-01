import { useState, useContext, createContext, useEffect } from 'react';
import axiosInstance from '../api/axiosApi';

const authContext = createContext();

export function ProvideAuth({ children }) {
    const auth = useProvideAuth();
    return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export function useAuth() {
    return useContext(authContext);
}

function useProvideAuth() {
    const [user, setUser] = useState(null);

    const login = async (username, password) => {
        try {
            // Use the base URL from environment variables, with `/api/login/` as the endpoint
            const response = await axiosInstance.post(`https://budget-tracker-production-c5da.up.railway.app/api/login/`, {
                username,
                password,
            });
            const token = response.data.token;
            localStorage.setItem('token', token);

            // Set user as logged in
            setUser({ username });

            return response.data;
        } catch (error) {
            // Log error details for better debugging
            console.error("Login error:", error.response?.data || error.message);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Assume valid token for simplicity
            setUser({ username: "dummy" });
        }
    }, []);

    return {
        user,
        login,
        logout
    };
}
