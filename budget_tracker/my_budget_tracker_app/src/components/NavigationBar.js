import React from 'react';
import '../styles/NavigationBar.css';

const NavigationBar = () => {
    return (
        <div className="navigation-bar">
            <h3>Navigation</h3>
            <div className="navigation-buttons">
                <button>View Expenses</button>
                <button>Add Expense</button>
                <button>View Expense Categories</button>
                <button>Add Expense Category</button>
                <button>View Incomes</button>
                <button>Add Income</button>
                <button>View Income Categories</button>
                <button>Add Income Category</button>
                <button>View Credit Cards</button>
                <button>Add Credit Card</button>
            </div>
        </div>
    );
};

export default NavigationBar;
