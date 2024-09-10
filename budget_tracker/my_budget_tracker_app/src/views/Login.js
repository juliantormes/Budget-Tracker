import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import InputField from '../components/InputField';
import ErrorMessage from '../components/ErrorMessage';
import SubmitButton from '../components/SubmitButton';
import '../styles/AuthFormStyles.css';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const navigate = useNavigate();
    const { login } = useAuth();

    // Basic client-side validation
    const validateForm = () => {
        if (!username || !password) {
            setError('Username and password are required.');
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
        } finally {
            setIsLoading(false); // Remove loading state
        }
    };

    return (
        <div className="auth-page-container" style={{ backgroundImage: `url('/images/Preview2.png')` }}>
            <div className="auth-form-overlay">
                <form onSubmit={handleSubmit} className="form">
                    <h2 className="form-title">Login</h2>
                    {error && <ErrorMessage error={error} />} {/* Show error if exists */}
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
                    <SubmitButton
                        text={isLoading ? 'Logging in...' : 'Log In'}
                        className="submit-button"
                        disabled={isLoading} // Disable button during loading
                    />
                    <SubmitButton
                        onClick={() => navigate('/register')}
                        text="Don't have an account? Register"
                        type="button"
                        className="redirect-button"
                        disabled={isLoading} // Disable redirection during loading
                    />
                </form>
            </div>
        </div>
    );
};

export default LoginForm;
