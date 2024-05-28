import React from 'react';
import Header from '../components/Header';
import SidebarMenu from '../components/SidebarMenu';
import { useAuth } from '../hooks/useAuth';

const AddIncomes = () => {
  const { logout } = useAuth();

  return (
    <div className="add-incomes">
      <div className="sidebar-container">
        <SidebarMenu />
      </div>
      <div className="content">
        <Header logout={logout} />
        <h1>Add Incomes</h1>
        {/* Add your content here */}
      </div>
    </div>
  );
};

export default AddIncomes;
