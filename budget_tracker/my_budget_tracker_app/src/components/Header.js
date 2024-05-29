import React from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutIcon from '@mui/icons-material/Logout';

const Header = ({ logout }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); // Redirect to the login page
    };

    return (
        <header className="homepage-header">
            <div className="header-left">
                <button className="header-title" onClick={() => navigate('/home')}>
                    Budget Tracker
                </button>
            </div>
            <button className="logout-button" onClick={handleLogout}>
                <LogoutIcon /> Logout
            </button>
        </header>
    );
};

export default Header;
