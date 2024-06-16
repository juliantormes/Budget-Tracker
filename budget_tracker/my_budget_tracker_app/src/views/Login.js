import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import InputField from '../components/InputField';
import ErrorMessage from '../components/ErrorMessage';
import SubmitButton from '../components/SubmitButton';
import AuthFormContainer from '../components/AuthFormContainer';
import '../styles/AuthFormStyles.css';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        try {
            await login(username, password);
            navigate('/home');
        } catch (error) {
            console.error('Login failed:', error);
            if (error.response) {
                switch (error.response.status) {
                    case 401:
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
        <AuthFormContainer>
            <form onSubmit={handleSubmit} className="form">
                <h2 className="form-title">Login</h2>
                <ErrorMessage error={error} />
                <InputField
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="input-field"
                />
                <InputField
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="input-field"
                />
                <SubmitButton text="Log In" className="submit-button" />
                <SubmitButton onClick={() => navigate('/register')} text="Don't have an account? Register" type="button" className="redirect-button" />
            </form>
        </AuthFormContainer>
    );
};

export default LoginForm;
