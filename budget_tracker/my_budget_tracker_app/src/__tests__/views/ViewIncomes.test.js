import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import ViewIncomes from '../../views/ViewIncomes'; 
import { useAuth } from '../../hooks/useAuth';
import { useFetchFinancialData } from '../../hooks/useFetchFinancialData';
import axiosInstance from '../../api/axiosApi';
import dayjs from 'dayjs';

// Mock hooks and API instance
jest.mock('../../hooks/useAuth');
jest.mock('../../hooks/useFetchFinancialData');
jest.mock('../../api/axiosApi');

beforeAll(() => {
    global.ResizeObserver = class {
        constructor() {}
        observe() {}
        unobserve() {}
        disconnect() {}
    };
});

beforeEach(() => {
  jest.clearAllMocks();
  
  useAuth.mockReturnValue({
    logout: jest.fn(),
  });

  useFetchFinancialData.mockReturnValue({
    data: { incomes: [] },
    refetch: jest.fn(),
  });
});

describe('ViewIncomes Component', () => {
  const categoriesMock = [
    { id: 1, name: 'Salary' },
    { id: 2, name: 'Freelance' }
  ];

  const renderComponent = () => {
    render(
      <Router>
        <ViewIncomes
          categories={categoriesMock}
          initialDate={dayjs('2024-10-01')}
          initialDateRange={[dayjs('2024-10-01'), dayjs('2024-10-31')]}
        />
      </Router>
    );
  };

  it('renders with incomes data', async () => {
    useFetchFinancialData.mockReturnValueOnce({
      data: {
        incomes: [
          {
            id: 1,
            date: '2024-10-01',
            amount: 3000,
            category: 1,
            description: 'Monthly Salary',
            is_recurring: true,
          },
          {
            id: 2,
            date: '2024-10-10',
            amount: 500,
            category: 2,
            description: 'Freelance Project',
            is_recurring: false,
          },
        ],
      },
      refetch: jest.fn(),
    });

    renderComponent();

    // Verify that the table rows are rendered for the incomes
    const incomeRow1 = await screen.findByTestId('income-row-1');
    const incomeRow2 = await screen.findByTestId('income-row-2');

    expect(incomeRow1).toBeInTheDocument();
    expect(incomeRow2).toBeInTheDocument();

    // Verify specific income content
    expect(incomeRow1).toHaveTextContent('Salary');
    expect(incomeRow1).toHaveTextContent('Monthly Salary');
    expect(incomeRow1).toHaveTextContent('3000');
    expect(incomeRow1).toHaveTextContent('Yes'); // Recurring

    expect(incomeRow2).toHaveTextContent('Freelance');
    expect(incomeRow2).toHaveTextContent('Freelance Project');
    expect(incomeRow2).toHaveTextContent('500');
    expect(incomeRow2).toHaveTextContent('No'); // Not recurring
  });

  it('handles deleting an income', async () => {
    useFetchFinancialData.mockReturnValueOnce({
      data: { incomes: [{ id: 1, date: '2024-10-01', amount: 3000, category: 'Salary' }] },
      refetch: jest.fn(),
    });

    axiosInstance.delete.mockResolvedValueOnce({ status: 204 });

    renderComponent();

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.queryByText(/Salary/i)).not.toBeInTheDocument();
    });
  });
});
