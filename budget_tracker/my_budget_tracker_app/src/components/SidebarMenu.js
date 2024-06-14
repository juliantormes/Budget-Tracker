import React, { useState, useEffect } from 'react';
import { Sidebar as ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ExpenseIcon from '@mui/icons-material/Receipt';
import IncomeIcon from '@mui/icons-material/AttachMoney';
import { Link, useLocation } from 'react-router-dom';

const SidebarMenu = () => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({
    incomes: false,
    expenses: false,
    creditCard: false,
  });

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('income')) {
      setExpandedMenus((prevState) => ({ ...prevState, incomes: true }));
    } else if (path.includes('expense')) {
      setExpandedMenus((prevState) => ({ ...prevState, expenses: true }));
    } else if (path.includes('credit-card')) {
      setExpandedMenus((prevState) => ({ ...prevState, creditCard: true }));
    }
  }, [location.pathname]);

  const handleToggle = (menu) => {
    setExpandedMenus((prevState) => ({
      ...prevState,
      [menu]: !prevState[menu],
    }));
  };

  return (
    <ProSidebar
      rootStyles={{
        backgroundColor: '#1f2a40',
        borderRight: 'none',
      }}
    >
      <Menu
        menuItemStyles={{
          button: ({ level, active }) => ({
            color: '#e0e6ed', // Change text color to match your app
            backgroundColor: active ? '#2c3e50' : '#1f2a40', // Change background color for active and inactive states
            '&:hover': {
              backgroundColor: '#2c3e50', // Change hover background color
              color: '#4a90e2', // Change hover text color to match your app
            },
          }),
        }}
      >
        <SubMenu
          label="Incomes"
          icon={<IncomeIcon />}
          open={expandedMenus.incomes}
          onOpenChange={() => handleToggle('incomes')}
        >
          <MenuItem component={<Link to="/view-incomes" />}>View Incomes</MenuItem>
          <MenuItem component={<Link to="/add-incomes" />}>Add Incomes</MenuItem>
          <MenuItem component={<Link to="/view-income-category" />}>View Income Category</MenuItem>
          <MenuItem component={<Link to="/view-income-category?add=true" />}>Add Income Category</MenuItem>
        </SubMenu>
        <SubMenu
          label="Expenses"
          icon={<ExpenseIcon />}
          open={expandedMenus.expenses}
          onOpenChange={() => handleToggle('expenses')}
        >
          <MenuItem component={<Link to="/view-expenses" />}>View Expenses</MenuItem>
          <MenuItem component={<Link to="/add-expenses" />}>Add Expenses</MenuItem>
          <MenuItem component={<Link to="/view-expense-category" />}>View Expense Category</MenuItem>
          <MenuItem component={<Link to="/view-expense-category?add=true" />}>Add Expense Category</MenuItem>
        </SubMenu>
        <SubMenu
          label="Credit Card"
          icon={<CreditCardIcon />}
          open={expandedMenus.creditCard}
          onOpenChange={() => handleToggle('creditCard')}
        >
          <MenuItem component={<Link to="/view-credit-card" />}>View Credit Card</MenuItem>
          <MenuItem component={<Link to="/add-credit-card" />}>Add Credit Card</MenuItem>
        </SubMenu>
      </Menu>
    </ProSidebar>
  );
};

export default SidebarMenu;
