import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/FormStyles.css';


const RegisterForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
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
            // Optionally, handle errors more explicitly here
        }
    };

    return (
        <form onSubmit={handleSubmit} className="register-form">
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
            <button type="submit">Register</button>
        </form>
    );
};

export default RegisterForm;
