import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';  // Import useNavigate instead of useHistory

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();  // Create a navigate function using useNavigate

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log("Form submitted"); // Check if this logs when you press the login button
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
            // Optionally, handle errors more explicitly here
        }
    };

    return (
        <form onSubmit={handleSubmit}>
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
