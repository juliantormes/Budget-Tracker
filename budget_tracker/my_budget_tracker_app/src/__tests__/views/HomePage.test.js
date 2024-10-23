// Mock ResizeObserver globally
beforeAll(() => {
  global.ResizeObserver = class {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import HomePage from '../../views/HomePage';
import { useAuth } from '../../hooks/useAuth';
import { useFetchFinancialData } from '../../hooks/useFetchFinancialData';
import { useDateNavigation } from '../../hooks/useDateNavigation';
import { useLocation } from 'react-router-dom';

// Mock necessary hooks and components
jest.mock('../../hooks/useAuth');
jest.mock('../../hooks/useFetchFinancialData');
jest.mock('../../hooks/useDateNavigation');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

describe('HomePage View', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays loading while fetching data', () => {
    // Mock the hooks
    useAuth.mockReturnValue({ logout: jest.fn() });
    useFetchFinancialData.mockReturnValue({ loading: true });
    useDateNavigation.mockReturnValue({ goToPreviousMonth: jest.fn(), goToNextMonth: jest.fn() });
    useLocation.mockReturnValue({ pathname: '/view-incomes' });

    render(
      <Router>
        <HomePage />
      </Router>
    );

    // Assert that the loading component is displayed
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays error message when fetch fails', () => {
    // Mock the hooks
    useAuth.mockReturnValue({ logout: jest.fn() });
    useFetchFinancialData.mockReturnValue({ loading: false, error: { message: 'Error fetching data' } });
    useDateNavigation.mockReturnValue({ goToPreviousMonth: jest.fn(), goToNextMonth: jest.fn() });
    useLocation.mockReturnValue({ pathname: '/view-incomes' });

    render(
      <Router>
        <HomePage />
      </Router>
    );

    // Assert that the error component is displayed with the correct message
    expect(screen.getByText(/error fetching data/i)).toBeInTheDocument();
  });

  it('displays financial summary when data is fetched successfully', () => {
    // Mock the hooks
    useAuth.mockReturnValue({ logout: jest.fn() });
    useFetchFinancialData.mockReturnValue({
      loading: false,
      error: null,
      incomeChartData: { labels: ['Income'], datasets: [{ data: [1000] }] },
      expenseChartData: { labels: ['Expense'], datasets: [{ data: [500] }] },
      creditCardChartData: { labels: ['Credit Card'], datasets: [{ data: [300] }] },
      totalIncome: 5000,
      totalExpenses: 2000,
      totalCreditCardDebt: 1000,
      net: 2000,
      barChartData: {
        labels: ['Net', 'Income', 'Expenses'],
        datasets: [
          {
            label: 'Financial Overview',
            data: [2000, 5000, 2000],
            backgroundColor: ['#4CAF50', '#FF6384', '#36A2EB'],
            borderColor: ['#4CAF50', '#FF6384', '#36A2EB'],
            borderWidth: 1,
          },
        ],
      },
    });
    useDateNavigation.mockReturnValue({ goToPreviousMonth: jest.fn(), goToNextMonth: jest.fn() });
    useLocation.mockReturnValue({ pathname: '/view-incomes' }); // Mocking a valid pathname

    render(
      <Router>
        <HomePage />
      </Router>
    );

    expect(screen.getByText(/Total Incomes/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Expenses/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Credit Card/i)).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Net:'))).toBeInTheDocument();


    
  });

  it('calls navigation hooks when navigating between months', () => {
    const goToPreviousMonth = jest.fn();
    const goToNextMonth = jest.fn();

    // Mock the hooks
    useAuth.mockReturnValue({ logout: jest.fn() });
    useFetchFinancialData.mockReturnValue({
      loading: false,
      error: null,
      incomeChartData: { datasets: [] },
      expenseChartData: { datasets: [] },
      creditCardChartData: { datasets: [] },
      totalIncome: 5000,
      totalExpenses: 2000,
      totalCreditCardDebt: 1000,
      net: 2000,
      barChartData: { labels: [], datasets: [] },
    });
    useDateNavigation.mockReturnValue({ goToPreviousMonth, goToNextMonth });
    useLocation.mockReturnValue({ pathname: '/view-incomes' }); // Mocking a valid pathname

    render(
      <Router>
        <HomePage />
      </Router>
    );

    // Simulate navigation
    fireEvent.click(screen.getByText(/previous/i)); // Assuming there's a button to go to the previous month
    fireEvent.click(screen.getByText(/next/i)); // Assuming there's a button to go to the next month

    // Assert that navigation functions are called
    expect(goToPreviousMonth).toHaveBeenCalled();
    expect(goToNextMonth).toHaveBeenCalled();
  });
});
