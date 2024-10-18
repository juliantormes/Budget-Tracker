import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SidebarMenu from '../../components/SidebarMenu';

// Mock ResizeObserver to avoid errors
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('SidebarMenu Component', () => {
  it('renders the SidebarMenu correctly', () => {
    render(
      <MemoryRouter>
        <SidebarMenu />
      </MemoryRouter>
    );
    expect(screen.getByText('Incomes')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
  });

  it('expands the "Incomes" SubMenu when the route contains "income"', () => {
    render(
      <MemoryRouter initialEntries={['/view-incomes']}>
        <SidebarMenu />
      </MemoryRouter>
    );
    expect(screen.getByText('Incomes')).toBeInTheDocument();
  });

  it('expands the "Expenses" SubMenu when the route contains "expense"', () => {
    render(
      <MemoryRouter initialEntries={['/view-expenses']}>
        <SidebarMenu />
      </MemoryRouter>
    );
    expect(screen.getByText('Expenses')).toBeInTheDocument();
  });

  it('expands the "Credit Card" SubMenu when the route contains "credit-card"', () => {
    render(
      <MemoryRouter initialEntries={['/view-credit-card']}>
        <SidebarMenu />
      </MemoryRouter>
    );
    expect(screen.getByText('Credit Card')).toBeInTheDocument();
  });

  it('toggles the "Incomes" SubMenu when clicked', () => {
    render(
      <MemoryRouter>
        <SidebarMenu />
      </MemoryRouter>
    );

    const incomesMenu = screen.getByText('Incomes');
    fireEvent.click(incomesMenu);
    expect(screen.getByText('View Incomes')).toBeInTheDocument();
  });

  it('navigates to the correct route when a "MenuItem" is clicked', () => {
    render(
      <MemoryRouter>
        <SidebarMenu />
      </MemoryRouter>
    );

    const viewIncomesMenuItem = screen.getByText('View Incomes');
    fireEvent.click(viewIncomesMenuItem);
    expect(viewIncomesMenuItem.closest('a')).toHaveAttribute('href', '/view-incomes');
  });
});
