import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import ErrorMessage from '../components/ErrorMessage';
import SubmitButton from '../components/SubmitButton';
import '../styles/AuthFormStyles.css';

const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match. Please try again.');
            return;
        }

        setError('');

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}signup/`, {
                username,
                password,
            });
            const token = response.data.token;
            localStorage.setItem('token', token);
            navigate('/home');
        } catch (error) {
            console.error('Registration failed:', error);
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        setError('Please ensure all fields are filled correctly.');
                        break;
                    case 409:
                        setError('Username already in use. Please choose another.');
                        break;
                    case 422:
                        setError('Invalid data entered. Please check and try again.');
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
        <div className="auth-page-container" style={{ backgroundImage: `url('/images/Preview.png')` }}>
            <div className="auth-form-overlay">
                <form onSubmit={handleSubmit} className="form">
                    <h2 className="form-title">Register</h2>
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
                    <InputField
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        className="input-field"
                    />
                    <SubmitButton text="Register" className="submit-button" />
                    <SubmitButton onClick={() => navigate('/login')} text="Already have an account? Login" type="button" className="redirect-button" />
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;
