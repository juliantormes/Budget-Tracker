import React from 'react';
import { Sidebar as ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PieChartIcon from '@mui/icons-material/PieChart';
import ExpenseIcon from '@mui/icons-material/Receipt';
import IncomeIcon from '@mui/icons-material/AttachMoney';
import { Link } from 'react-router-dom';

const SidebarMenu = () => (
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
            <SubMenu label="Incomes" icon={<IncomeIcon />}>
                <MenuItem component={<Link to="/view-incomes" />}>View Incomes</MenuItem>
                <MenuItem component={<Link to="/add-incomes" />}>Add Incomes</MenuItem>
                <MenuItem component={<Link to="/view-income-category" />}>View Income Category</MenuItem>
                <MenuItem component={<Link to="/add-income-category" />}>Add Income Category</MenuItem>
            </SubMenu>
            <SubMenu label="Expenses" icon={<ExpenseIcon />}>
                <MenuItem component={<Link to="/view-expenses" />}>View Expenses</MenuItem>
                <MenuItem component={<Link to="/add-expenses" />}>Add Expenses</MenuItem>
                <MenuItem component={<Link to="/view-expense-category" />}>View Expense Category</MenuItem>
                <MenuItem component={<Link to="/add-expense-category" />}>Add Expense Category</MenuItem>
            </SubMenu>
            <SubMenu label="Credit Card" icon={<CreditCardIcon />}>
                <MenuItem component={<Link to="/view-credit-card" />}>View Credit Card</MenuItem>
                <MenuItem component={<Link to="/add-credit-card" />}>Add Credit Card</MenuItem>
            </SubMenu>
            <SubMenu label="Graphics" icon={<PieChartIcon />}>
                <MenuItem component={<Link to="/pie-graphics" />}>Pie Graphics</MenuItem>
                <MenuItem component={<Link to="/bar-graphics" />}>Bar Graphics</MenuItem>
            </SubMenu>
        </Menu>
    </ProSidebar>
);

export default SidebarMenu;
