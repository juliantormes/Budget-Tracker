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
            const response = await axiosInstance.post('/login', { username, password });
            setUser(response.data.user);
            localStorage.setItem('token', response.data.token);
            return response.data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        return;
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Validate token and load user
        }
    }, []);

    return {
        user,
        login,
        logout
    };
}
