import React from 'react';
import Header from '../components/Header';
import SidebarMenu from '../components/SidebarMenu';
import { useAuth } from '../hooks/useAuth';

const ViewExpenses = () => {
  const { logout } = useAuth();

  return (
    <div className="view-expenses">
      <div className="sidebar-container">
        <SidebarMenu />
      </div>
      <div className="content">
        <Header logout={logout} />
        <h1>View Expenses</h1>
        {/* Add your content here */}
      </div>
    </div>
  );
};

export default ViewExpenses;
