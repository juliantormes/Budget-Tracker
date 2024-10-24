import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import axiosInstance from '../../api/axiosApi';
import ViewIncomes from '../../views/ViewIncomes';
import { useAuth } from '../../hooks/useAuth';
import { useFetchFinancialData } from '../../hooks/useFetchFinancialData';

// Mock axios instance
jest.mock('../../api/axiosApi');

// Mock the useAuth hook
jest.mock('../../hooks/useAuth');

// Mock useFetchFinancialData hook
jest.mock('../../hooks/useFetchFinancialData');

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
  // Default mock return value for useFetchFinancialData
  useFetchFinancialData.mockReturnValue({
    data: { incomes: [] },
    refetch: jest.fn(),
  });
});

describe('ViewIncomes View', () => {
  it('renders the incomes correctly', async () => {
    useFetchFinancialData.mockReturnValueOnce({
      data: {
        incomes: [
          { id: 1, date: '2024-10-01', amount: 1000, category: 'Salary' },
          { id: 2, date: '2024-10-10', amount: 200, category: 'Bonus' },
        ],
      },
      refetch: jest.fn(),
    });

    render(
      <Router>
        <ViewIncomes />
      </Router>
    );

    await waitFor(() => {
      // Use getByText for more specificity
      const salaryCell = screen.getByText('Salary');
      const bonusCell = screen.getByText('Bonus');
      
      expect(salaryCell).toBeInTheDocument();
      expect(bonusCell).toBeInTheDocument();
    });
  });

  it('handles editing an income', async () => {
    useFetchFinancialData.mockReturnValueOnce({
      data: {
        incomes: [
          { id: 1, date: '2024-10-01', amount: 1000, category: 'Salary' },
        ],
      },
      refetch: jest.fn(),
    });

    axiosInstance.put.mockResolvedValueOnce({
      status: 200,
      data: { id: 1, amount: 1200, category: 'Salary' },
    });

    render(
      <Router>
        <ViewIncomes />
      </Router>
    );

    await waitFor(() => {
      const salaryCell = screen.getByText('Salary');
      expect(salaryCell).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit')); // Edit button

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: 1200 },
    });

    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      const updatedAmountCell = screen.getByText('1200');
      expect(updatedAmountCell).toBeInTheDocument();
    });
  });

  it('handles deleting an income', async () => {
    useFetchFinancialData.mockReturnValueOnce({
      data: [{ id: 1, date: '2024-10-01', amount: 1000, category: 'Salary' }],
      refetch: jest.fn(),
    });

    axiosInstance.delete.mockResolvedValueOnce({ status: 204 });

    render(
      <Router>
        <ViewIncomes />
      </Router>
    );

    await waitFor(() => {
      const salaryCell = screen.getByText('Salary');
      expect(salaryCell).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Delete'));

    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(screen.queryByText('Salary')).not.toBeInTheDocument();
    });
  });

  it('handles adding a new recurring income', async () => {
    useFetchFinancialData.mockReturnValueOnce({
      data: [{ id: 1, date: '2024-10-01', amount: 1000, category: 'Salary' }],
      refetch: jest.fn(),
    });

    axiosInstance.post.mockResolvedValueOnce({
      status: 201,
      data: { id: 2, date: '2024-11-01', amount: 1500, category: 'Bonus' },
    });

    render(
      <Router>
        <ViewIncomes />
      </Router>
    );

    await waitFor(() => {
      const salaryCell = screen.getByText('Salary');
      expect(salaryCell).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Add Recurring Income'));

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: 1500 },
    });

    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      const bonusCell = screen.getByText('Bonus');
      expect(bonusCell).toBeInTheDocument();
    });
  });

  it('handles errors during income saving', async () => {
    useFetchFinancialData.mockReturnValueOnce({
      data: [{ id: 1, date: '2024-10-01', amount: 1000, category: 'Salary' }],
      refetch: jest.fn(),
    });

    axiosInstance.put.mockRejectedValueOnce(new Error('Failed to save'));

    render(
      <Router>
        <ViewIncomes />
      </Router>
    );

    await waitFor(() => {
      const salaryCell = screen.getByText('Salary');
      expect(salaryCell).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit'));

    fireEvent.change(screen.getByLabelText(/amount/i), {
      target: { value: 1200 },
    });

    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      expect(screen.getByText('Failed to save the income. Please try again.')).toBeInTheDocument();
    });
  });
});
