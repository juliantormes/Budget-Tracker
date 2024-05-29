import { useState, useContext, createContext, useEffect } from 'react';
import axios from 'axios';

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
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}login/`, {
                username,
                password,
            });
            const token = response.data.token;
            localStorage.setItem('token', token);

            // Set user as logged in
            setUser({ username });

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
            // Assuming token is valid if present
            setUser({ username: "dummy" });
        }
    }, []);

    return {
        user,
        login,
        logout
    };
}
