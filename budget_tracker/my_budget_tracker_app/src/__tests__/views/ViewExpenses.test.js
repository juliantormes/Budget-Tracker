import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import axiosInstance from '../../api/axiosApi';
import ViewExpenses from '../../views/ViewExpenses';
import { useAuth } from '../../hooks/useAuth';
import { useFetchFinancialData } from '../../hooks/useFetchFinancialData'; // Import the hook

// Mock axios instance
jest.mock('../../api/axiosApi');

// Mock the useAuth hook
jest.mock('../../hooks/useAuth');

// Mock the `useFetchFinancialData` hook
jest.mock('../../hooks/useFetchFinancialData', () => ({
  useFetchFinancialData: jest.fn(),
}));

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

  // Return a mock object from useFetchFinancialData
  useFetchFinancialData.mockReturnValue({
    data: {
      expenses: [
        { id: 1, name: 'Groceries', amount: 50, date: '2023-10-10' },
        { id: 2, name: 'Rent', amount: 1000, date: '2023-10-05' },
      ],
    },
    refetch: jest.fn(),
  });
});

describe('ViewExpenses Component', () => {
  it('renders the ViewExpenses component correctly', async () => {
    render(
      <Router>
        <ViewExpenses />
      </Router>
    );

    // Check if the header and components are rendered
    expect(screen.getByText('View Expenses')).toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();
  });

  it('handles date selection and updates displayed expenses', async () => {
    render(
      <Router>
        <ViewExpenses />
      </Router>
    );

    // Wait for the expenses to load
    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.getByText('Rent')).toBeInTheDocument();
    });

    // Simulate date change
    const newDate = '2023-10-10';
    const dateInput = screen.getByLabelText(/effective date/i);
    fireEvent.change(dateInput, { target: { value: newDate } });

    // Check that the correct expenses are displayed
    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
    });
  });

  it('handles editing an expense', async () => {
    render(
      <Router>
        <ViewExpenses />
      </Router>
    );

    // Simulate clicking on the edit button
    const editButton = screen.getAllByTestId('EditIcon')[0]; // Assuming the EditIcon has a test id
    fireEvent.click(editButton);

    // Wait for the editing form to appear
    await waitFor(() => {
      const amountInput = screen.getByLabelText('New Amount');
      fireEvent.change(amountInput, { target: { value: '75' } });
      expect(amountInput.value).toBe('75');
    });

    // Simulate clicking save
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    // Expect the refetch function to be called after saving
    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
    });
  });

  it('handles deleting an expense', async () => {
    render(
      <Router>
        <ViewExpenses />
      </Router>
    );

    // Wait for the expenses to load
    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.getByText('Rent')).toBeInTheDocument();
    });

    // Simulate deleting an expense
    const deleteButton = screen.getAllByTestId('DeleteIcon')[0]; // Assuming DeleteIcon has a test id
    fireEvent.click(deleteButton);

    // Confirm the delete action
    const confirmButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);

    // Wait for the expense to be deleted and removed from the document
    await waitFor(() => {
      expect(screen.queryByText('Groceries')).not.toBeInTheDocument();
    });
  });

  it('handles errors when saving an expense', async () => {
    render(
      <Router>
        <ViewExpenses />
      </Router>
    );

    // Simulate clicking the edit button
    const editButton = screen.getAllByTestId('EditIcon')[0];
    fireEvent.click(editButton);

    // Simulate saving with an invalid amount
    const amountInput = screen.getByLabelText('New Amount');
    fireEvent.change(amountInput, { target: { value: '' } }); // Empty amount
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    // Expect an error message to be shown
    await waitFor(() => {
      expect(screen.getByText('Failed to save the expense. Please try again.')).toBeInTheDocument();
    });
  });
});
