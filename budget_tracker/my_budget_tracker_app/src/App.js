import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Update imports
import LoginForm from './components/Login';
import HomePage from './components/HomePage';

const App = () => {
  return (
    <Router>
      <Routes> {/* Replace Switch with Routes */}
        <Route path="/home" element={<HomePage />} /> {/* Update Route syntax */}
        <Route path="/" element={<LoginForm />} /> {/* Update Route syntax */}
      </Routes>
    </Router>
  );
};

export default App;
