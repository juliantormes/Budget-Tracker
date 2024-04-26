import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDateNavigation } from '../hooks/useDateNavigation';
import { format } from 'date-fns';

const Header = ({ year, month }) => {
    const { logout } = useAuth();
    const { goToPreviousMonth, goToNextMonth } = useDateNavigation(year, month);

    return (
        <header className="homepage-header">
            <h1>Budget Tracker</h1>
            <div className="date-navigation">
                <button onClick={goToPreviousMonth}>Previous Month</button>
                <span>{format(new Date(year, month - 1, 1), 'MMMM yyyy')}</span>
                <button onClick={goToNextMonth}>Next Month</button>
            </div>
            <button className="logout-button" onClick={logout}>LOGOUT</button>
        </header>
    );
};

export default Header;
