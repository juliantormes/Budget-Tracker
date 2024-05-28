import React from 'react';
import Header from '../components/Header';
import SidebarMenu from '../components/SidebarMenu';
import { useAuth } from '../hooks/useAuth';

const PieGraphics = () => {
  const { logout } = useAuth();

  return (
    <div className="pie-graphics">
      <div className="sidebar-container">
        <SidebarMenu />
      </div>
      <div className="content">
        <Header logout={logout} />
        <h1>Pie Graphics</h1>
        {/* Add your content here */}
      </div>
    </div>
  );
};

export default PieGraphics;
