import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/FormStyles.css';

const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Check if passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match. Please try again.');
            return;
        }

        setError('');  // Reset error message

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}signup/`, {
                username,
                password,
            });
            const token = response.data.token;
            localStorage.setItem('token', token);
            navigate('/home');  // Navigate to home after successful registration
        } catch (error) {
            console.error('Registration failed:', error);
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        setError('Please ensure all fields are filled correctly.');
                        break;
                    case 409: // Conflict status, could be used for duplicate username
                        setError('Username already in use. Please choose another.');
                        break;
                    case 422: // Unprocessable entity, might be used for validation errors
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
        <div className="form-container">
            <form onSubmit={handleSubmit} className="form">
                <h2>Register</h2>
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
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                />
                <button type="submit">Register</button>
            </form>
            <button onClick={() => navigate('/login')} className="redirect-button">Already have an account? Login</button>
        </div>
    );
};

export default RegisterForm;
