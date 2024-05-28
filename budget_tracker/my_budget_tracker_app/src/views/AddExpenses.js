import React from 'react';
import Header from '../components/Header';
import SidebarMenu from '../components/SidebarMenu';
import { useAuth } from '../hooks/useAuth';

const AddExpenses = () => {
  const { logout } = useAuth();

  return (
    <div className="add-expenses">
      <div className="sidebar-container">
        <SidebarMenu />
      </div>
      <div className="content">
        <Header logout={logout} />
        <h1>Add Expenses</h1>
        {/* Add your content here */}
      </div>
    </div>
  );
};

export default AddExpenses;
