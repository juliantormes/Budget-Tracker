import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ProvideAuth } from './hooks/useAuth';
import HomePage from './views/HomePage';
import LoginForm from './views/Login';
import RegisterForm from './views/Register';
import ViewIncomes from './views/ViewIncomes';
import AddIncomes from './views/AddIncomes';
import ViewIncomeCategory from './views/ViewIncomeCategory';
import AddIncomeCategory from './views/AddIncomeCategory';
import ViewExpenses from './views/ViewExpenses';
import AddExpenses from './views/AddExpenses';
import ViewExpenseCategory from './views/ViewExpenseCategory';
import AddExpenseCategory from './views/AddExpenseCategory';
import ViewCreditCard from './views/ViewCreditCard';
import AddCreditCard from './views/AddCreditCard';
import PieGraphics from './views/PieGraphics';
import BarGraphics from './views/BarGraphics';

const App = () => {
  return (
    <ProvideAuth>
      <Router>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/view-incomes" element={<ViewIncomes />} />
          <Route path="/add-incomes" element={<AddIncomes />} />
          <Route path="/view-income-category" element={<ViewIncomeCategory />} />
          <Route path="/add-income-category" element={<AddIncomeCategory />} />
          <Route path="/view-expenses" element={<ViewExpenses />} />
          <Route path="/add-expenses" element={<AddExpenses />} />
          <Route path="/view-expense-category" element={<ViewExpenseCategory />} />
          <Route path="/add-expense-category" element={<AddExpenseCategory />} />
          <Route path="/view-credit-card" element={<ViewCreditCard />} />
          <Route path="/add-credit-card" element={<AddCreditCard />} />
          <Route path="/pie-graphics" element={<PieGraphics />} />
          <Route path="/bar-graphics" element={<BarGraphics />} />
        </Routes>
      </Router>
    </ProvideAuth>
  );
};

export default App;
