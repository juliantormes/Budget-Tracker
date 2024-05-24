import React from 'react';

const Header = ({ logout }) => (
    <div className="homepage-header">
        <div className="header-left">
            <span className="header-title">Budget Tracker</span>
        </div>
        <button className="logout-button" onClick={logout}>Logout</button>
    </div>
);

export default Header;
