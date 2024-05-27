import React from 'react';
import { Sidebar as ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PieChartIcon from '@mui/icons-material/PieChart';
import ExpenseIcon from '@mui/icons-material/Receipt';
import IncomeIcon from '@mui/icons-material/AttachMoney';

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
            <SubMenu label="Expenses" icon={<ExpenseIcon />}>
                <MenuItem>View Expenses</MenuItem>
                <MenuItem>Add Expenses</MenuItem>
                <MenuItem>View Expense Category</MenuItem>
                <MenuItem>Add Expense Category</MenuItem>
            </SubMenu>
            <SubMenu label="Incomes" icon={<IncomeIcon />}>
                <MenuItem>View Incomes</MenuItem>
                <MenuItem>Add Incomes</MenuItem>
                <MenuItem>View Income Category</MenuItem>
                <MenuItem>Add Income Category</MenuItem>
            </SubMenu>
            <SubMenu label="Credit Card" icon={<CreditCardIcon />}>
                <MenuItem>View Credit Card</MenuItem>
                <MenuItem>Add Credit Card</MenuItem>
            </SubMenu>
            <SubMenu label="Graphics" icon={<PieChartIcon />}>
                <MenuItem>Pie Graphics</MenuItem>
                <MenuItem>Bar Graphics</MenuItem>
            </SubMenu>
        </Menu>
    </ProSidebar>
);

export default SidebarMenu;
