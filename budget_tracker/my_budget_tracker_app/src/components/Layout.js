import React from 'react';
import PropTypes from 'prop-types';
import SidebarMenu from '../components/SidebarMenu';
import Header from '../components/Header';

const Layout = ({ children, logout }) => (
  <div className="layout">
    <div className="sidebar-container">
      <SidebarMenu />
    </div>
    <div className="content">
      <Header logout={logout} />
      {children}
    </div>
  </div>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  logout: PropTypes.func.isRequired,
};

export default Layout;
