import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Update imports
import LoginForm from './components/Login';
import HomePage from './components/HomePage';
import RegisterForm from './components/Register';

const App = () => {
  return (
    <Router>
      <Routes> {/* Replace Switch with Routes */}
        <Route path="/home" element={<HomePage />} /> {/* Update Route syntax */}
        <Route path="/login" element={<LoginForm />} /> {/* Update Route syntax */}
        <Route path="/register" element={<RegisterForm />} /> {/* Update Route syntax */}
      </Routes>
    </Router>
  );
};

export default App;
