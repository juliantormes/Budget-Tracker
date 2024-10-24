import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import axiosInstance from '../../api/axiosApi';
import ViewExpenseCategory from '../../views/ViewExpenseCategory';
import { useAuth } from '../../hooks/useAuth';

// Mock axios instance
jest.mock('../../api/axiosApi');

// Mock the useAuth hook
jest.mock('../../hooks/useAuth');

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
});

describe('ViewExpenseCategory View', () => {
  it('renders the categories correctly', async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Groceries' },
        { id: 2, name: 'Transport' },
      ],
    });

    render(
      <Router>
        <ViewExpenseCategory />
      </Router>
    );

    // Wait for the categories to load
    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
      expect(screen.getByText('Transport')).toBeInTheDocument();
    });
  });

  it('handles editing a category', async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Groceries' },
      ],
    });

    axiosInstance.put.mockResolvedValueOnce({
      status: 200,
      data: { id: 1, name: 'Food' },
    });

    render(
      <Router>
        <ViewExpenseCategory />
      </Router>
    );

    // Wait for the categories to load
    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
    });

    // Click edit
    fireEvent.click(screen.getByTestId('EditIcon'));

    // Change the form input
    fireEvent.change(screen.getByLabelText(/category name/i), {
      target: { value: 'Food' },
    });

    // Click save
    fireEvent.click(screen.getByTestId('save-button'));

    // Wait for the save action to complete
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
    });
  });

  it('handles adding a new category', async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Groceries' },
      ],
    });

    axiosInstance.post.mockResolvedValueOnce({
      status: 201,
      data: { id: 2, name: 'Utilities' },
    });

    render(
      <Router>
        <ViewExpenseCategory />
      </Router>
    );

    // Wait for the categories to load
    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
    });

    // Click Add button
    fireEvent.click(screen.getByRole('button', { name: /Add Expense Category/i }));

    // Fill out form and save
    fireEvent.change(screen.getByLabelText(/category name/i), {
      target: { value: 'Utilities' },
    });

    fireEvent.click(screen.getByTestId('save-button'));

    // Wait for the new category to appear
    await waitFor(() => {
      expect(screen.getByText('Utilities')).toBeInTheDocument();
    });
  });

  it('handles deleting a category', async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Groceries' },
      ],
    });

    axiosInstance.delete.mockResolvedValueOnce({
      status: 204,
    });

    render(
      <Router>
        <ViewExpenseCategory />
      </Router>
    );

    // Wait for the categories to load
    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
    });

    // Click delete
    fireEvent.click(screen.getByTestId('DeleteIcon'));

    // Confirm deletion in the dialog
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    // Expect the category to be removed
    await waitFor(() => {
      expect(screen.queryByText('Groceries')).not.toBeInTheDocument();
    });
  });

  it('handles errors when editing a category', async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Groceries' },
      ],
    });
  
    axiosInstance.put.mockRejectedValueOnce({
      response: {
        data: { name: ['This field is required.'] },
      },
    });
  
    render(
      <Router>
        <ViewExpenseCategory />
      </Router>
    );
  
    // Wait for the categories to load
    await waitFor(() => {
      expect(screen.getByText('Groceries')).toBeInTheDocument();
    });
  
    // Click edit
    fireEvent.click(screen.getByTestId('EditIcon'));
  
    // Clear the input and click save
    fireEvent.change(screen.getByLabelText(/category name/i), {
      target: { value: '' },
    });
  
    fireEvent.click(screen.getByTestId('save-button'));
  
    // Expect an error message
    await waitFor(() => {
      expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
    });
  });  
});
