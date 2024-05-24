import React from 'react';
import { Sidebar as ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';

export const Sidebar = () => (
    <ProSidebar className="sidebar">
        <Menu>
            <MenuItem>Username</MenuItem>
            <SubMenu label="Expenses">
                <MenuItem>View Expenses</MenuItem>
                <MenuItem>Add Expenses</MenuItem>
                <MenuItem>View Expense Category</MenuItem>
                <MenuItem>Add Expense Category</MenuItem>
            </SubMenu>
            <SubMenu label="Incomes">
                <MenuItem>View Incomes</MenuItem>
                <MenuItem>Add Incomes</MenuItem>
                <MenuItem>View Income Category</MenuItem>
                <MenuItem>Add Income Category</MenuItem>
            </SubMenu>
            <SubMenu label="Credit Card">
                <MenuItem>View Credit Card</MenuItem>
                <MenuItem>Add Credit Card</MenuItem>
            </SubMenu>
        </Menu>
    </ProSidebar>
);
