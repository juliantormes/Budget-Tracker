import React from 'react';
import Button from '@mui/material/Button';
import ViewListIcon from '@mui/icons-material/ViewList';
import AddIcon from '@mui/icons-material/Add';

const NavigationBar = () => {
    return (
        <div className="navigation-bar">
            <h3>Navigation</h3>
            <div className="navigation-buttons">
                <Button startIcon={<ViewListIcon />}>View Expenses</Button>
                <Button startIcon={<AddIcon />}>Add Expense</Button>
                <Button startIcon={<ViewListIcon />}>View Expense Categories</Button>
                <Button startIcon={<AddIcon />}>Add Expense Category</Button>
                <Button startIcon={<ViewListIcon />}>View Incomes</Button>
                <Button startIcon={<AddIcon />}>Add Income</Button>
                <Button startIcon={<ViewListIcon />}>View Income Categories</Button>
                <Button startIcon={<AddIcon />}>Add Income Category</Button>
                <Button startIcon={<ViewListIcon />}>View Credit Cards</Button>
                <Button startIcon={<AddIcon />}>Add Credit Card</Button>
            </div>
        </div>
    );
};

export default NavigationBar;
