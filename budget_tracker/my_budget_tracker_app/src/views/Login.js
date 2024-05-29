import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import InputField from '../components/InputField';
import ErrorMessage from '../components/ErrorMessage';
import SubmitButton from '../components/SubmitButton';
import '../styles/FormStyles.css';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');  // Reset error message

        try {
            await login(username, password);
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
        <div className="form-container">
            <form onSubmit={handleSubmit} className="form">
                <h2>Login</h2>
                <ErrorMessage error={error} />
                <InputField
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                />
                <InputField
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                />
                <SubmitButton text="Log In" />
            </form>
            <SubmitButton onClick={() => navigate('/register')} text="Don't have an account? Register" />
        </div>
    );
};

export default LoginForm;
