import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ProvideAuth, useAuth } from './hooks/useAuth';
import HomePage from './views/HomePage';
import LoginForm from './views/Login';
import RegisterForm from './views/Register';
import ViewIncomes from './views/ViewIncomes';
import AddIncomes from './views/AddIncomes';
import ViewIncomeCategory from './views/ViewIncomeCategory';
import ViewExpenses from './views/ViewExpenses';
import AddExpenses from './views/AddExpenses';
import ViewExpenseCategory from './views/ViewExpenseCategory';
import ViewCreditCard from './views/ViewCreditCard';
import AddCreditCard from './views/AddCreditCard';
import './styles/global.css';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const { user } = useAuth();
  return user ? <Component {...rest} /> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ element: Component, ...rest }) => {
  const { user } = useAuth();
  return !user ? <Component {...rest} /> : <Navigate to="/home" replace />;
};

const App = () => {
  return (
    <ProvideAuth>
      <Router>
        <Routes>
          {/* Root route now redirects to home if logged in or login if not */}
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<PrivateRoute element={HomePage} />} />
          <Route path="/login" element={<PublicRoute element={LoginForm} />} />
          <Route path="/register" element={<PublicRoute element={RegisterForm} />} />
          <Route path="/view-incomes" element={<PrivateRoute element={ViewIncomes} />} />
          <Route path="/add-incomes" element={<PrivateRoute element={AddIncomes} />} />
          <Route path="/view-income-category" element={<PrivateRoute element={ViewIncomeCategory} />} />
          <Route path="/view-expenses" element={<PrivateRoute element={ViewExpenses} />} />
          <Route path="/add-expenses" element={<PrivateRoute element={AddExpenses} />} />
          <Route path="/view-expense-category" element={<PrivateRoute element={ViewExpenseCategory} />} />
          <Route path="/view-credit-card" element={<PrivateRoute element={ViewCreditCard} />} />
          <Route path="/add-credit-card" element={<PrivateRoute element={AddCreditCard} />} />
        </Routes>
      </Router>
    </ProvideAuth>
  );
};

export default App;
