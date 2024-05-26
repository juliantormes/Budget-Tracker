import React from 'react';
import { Sidebar as ProSidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import { sidebarClasses, menuClasses } from 'react-pro-sidebar';

const SidebarMenu = () => (
    <ProSidebar
        rootStyles={{
            [`.${sidebarClasses.container}`]: {
                backgroundColor: '#1f2a40',
                borderRight: 'none',
            },
            [`.${menuClasses.subMenuContent}`]: {
                backgroundColor: '#1f2a40',
            },
        }}
    >
        <Menu
            menuItemStyles={{
                button: ({ level, active }) => {
                    if (level === 0) {
                        return {
                            color: '#ffffff',
                            backgroundColor: active ? '#2c3e50' : undefined,
                            '&:hover': {
                                backgroundColor: '#2c3e50',
                                color: '#ffffff',
                            },
                        };
                    }
                    return {
                        color: '#ffffff',
                        backgroundColor: active ? '#357ABD' : '#1f2a40',
                        '&:hover': {
                            backgroundColor: '#357ABD',
                            color: '#ffffff',
                        },
                    };
                },
            }}
        >
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
            <SubMenu label="Graphics">
                <MenuItem>Pie Graphics</MenuItem>
                <MenuItem>Bar Graphics</MenuItem>
            </SubMenu>
        </Menu>
    </ProSidebar>
);

export default SidebarMenu;
