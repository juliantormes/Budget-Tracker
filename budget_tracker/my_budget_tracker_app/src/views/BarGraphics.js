import React from 'react';
import Header from '../components/Header';
import SidebarMenu from '../components/SidebarMenu';
import { useAuth } from '../hooks/useAuth';

const BarGraphics = () => {
  const { logout } = useAuth();

  return (
    <div className="bar-graphics">
      <div className="sidebar-container">
        <SidebarMenu />
      </div>
      <div className="content">
        <Header logout={logout} />
        <h1>Bar Graphics</h1>
        {/* Add your content here */}
      </div>
    </div>
  );
};

export default BarGraphics;
