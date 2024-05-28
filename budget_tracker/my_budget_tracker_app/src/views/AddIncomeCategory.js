import React from 'react';
import Header from '../components/Header';
import SidebarMenu from '../components/SidebarMenu';
import { useAuth } from '../hooks/useAuth';

const AddIncomeCategory = () => {
  const { logout } = useAuth();
  
  return (
    <div className="add-income-category">
      <div className="sidebar-container">
        <SidebarMenu />
      </div>
      <div className="content">
        <Header logout={logout} />
        <h1>Add Income Category</h1>
        {/* Add your content here */}
      </div>
    </div>
  );
};

export default AddIncomeCategory;
