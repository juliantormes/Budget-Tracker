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
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const navigate = useNavigate();

    // Client-side validation for matching passwords and non-empty fields
    const validateForm = () => {
        if (!username || !password || !confirmPassword) {
            setError('All fields are required.');
            return false;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match. Please try again.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(''); // Clear previous errors

        if (!validateForm()) return; // Prevent submission if validation fails

        setIsLoading(true); // Set loading state

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
        } finally {
            setIsLoading(false); // Remove loading state
        }
    };

    return (
        <div className="auth-page-container" style={{ backgroundImage: `url('/images/Preview2.png')` }}>
            <div className="auth-form-overlay">
                <form onSubmit={handleSubmit} className="form">
                    <h2 className="form-title">Register</h2>
                    <ErrorMessage error={error} /> {/* Show error if exists */}
                    <InputField
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        className="input-field"
                        disabled={isLoading} // Disable input during loading
                    />
                    <InputField
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="input-field"
                        disabled={isLoading} // Disable input during loading
                    />
                    <InputField
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        className="input-field"
                        disabled={isLoading} // Disable input during loading
                    />
                    <SubmitButton
                        text={isLoading ? 'Registering...' : 'Register'}
                        className="submit-button"
                        disabled={isLoading} // Disable button during loading
                    />
                    <SubmitButton
                        onClick={() => navigate('/login')}
                        text="Already have an account? Login"
                        type="button"
                        className="redirect-button"
                        disabled={isLoading} // Disable redirection during loading
                    />
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;
