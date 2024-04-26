import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ProvideAuth } from './hooks/useAuth'; // Make sure this import path is correct
import LoginForm from './views/Login';
import HomePage from './views/HomePage';
import RegisterForm from './views/Register';

const App = () => {
  return (
    <ProvideAuth> {/* Wrap everything within ProvideAuth */}
      <Router>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
        </Routes>
      </Router>
    </ProvideAuth>
  );
};

export default App;
