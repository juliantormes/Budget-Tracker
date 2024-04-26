import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/FormStyles.css';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');  // Reset error message

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}login/`, {
                username,
                password,
            });
            const token = response.data.token;
            localStorage.setItem('token', token);
            navigate('/home');  // Navigate to home after successful login
        } catch (error) {
            console.error('Login failed:', error);
            if (error.response) {
                switch (error.response.status) {
                    case 401:  // Handle both non-existent user and wrong password under the same case
                        setError('Invalid username or password. Please try again.');
                        break;
                    default:
                        setError('An unexpected error occurred. Please try again later.');
                }
            } else {
                setError('Unable to connect to the server. Check your network connection.');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form">
            {error && <div className="error-message">{error}</div>}
            <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            <button type="submit">Log In</button>
        </form>
    );
};

export default LoginForm;
