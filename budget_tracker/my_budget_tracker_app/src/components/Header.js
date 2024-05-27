import React from 'react';
import LogoutIcon from '@mui/icons-material/Logout';

const Header = ({ logout }) => (
    <div className="homepage-header">
        <div className="header-left">
            <span className="header-title">Budget Tracker</span>
        </div>
        <button className="logout-button" onClick={logout}>
            <LogoutIcon /> Logout
        </button>
    </div>
);

export default Header;
