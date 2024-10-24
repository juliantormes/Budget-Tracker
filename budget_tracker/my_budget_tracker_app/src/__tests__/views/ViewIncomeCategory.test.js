import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import axiosInstance from '../../api/axiosApi';
import ViewIncomeCategory from '../../views/ViewIncomeCategory';
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

describe('ViewIncomeCategory View', () => {
  it('renders the categories correctly', async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Salary' },
        { id: 2, name: 'Dividends' },
      ],
    });

    render(
      <Router>
        <ViewIncomeCategory />
      </Router>
    );

    // Wait for the categories to load
    await waitFor(() => {
      expect(screen.getByText('Salary')).toBeInTheDocument();
      expect(screen.getByText('Dividends')).toBeInTheDocument();
    });
  });

  it('handles editing a category', async () => {
    // Mock the API call to return categories with the correct structure
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Salary' },
      ],
    });
  
    // Mock the API call for updating the category
    axiosInstance.put.mockResolvedValueOnce({
      status: 200,
      data: { id: 1, name: 'Bonus' },
    });
  
    // Render the component
    render(
      <Router>
        <ViewIncomeCategory />
      </Router>
    );
  
    // Wait for the categories to load
    await waitFor(() => {
      expect(screen.getByText('Salary')).toBeInTheDocument();
    });
  
    // Click edit - use the appropriate label or test id to locate the edit button
    fireEvent.click(screen.getByTestId('EditIcon'));
  
    // Change the form input
    fireEvent.change(screen.getByLabelText(/category name/i), {
        target: { value: 'Bonus' },
      });
  
  
    // Click save
    fireEvent.click(screen.getByTestId('save-button'));
  
    // Wait for the save action to complete
    await waitFor(() => {
      expect(screen.getByText('Bonus')).toBeInTheDocument();
    });
  });  

  it('handles adding a new category', async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Salary' },
      ],
    });

    axiosInstance.post.mockResolvedValueOnce({
      status: 201,
      data: { id: 2, name: 'Investments' },
    });

    render(
      <Router>
        <ViewIncomeCategory />
      </Router>
    );

    // Wait for the categories to load
    await waitFor(() => {
      expect(screen.getByText('Salary')).toBeInTheDocument();
    });

    // Click Add button
    fireEvent.click(screen.getByRole('button', { name: /add income category/i }));

    // Fill out form and save
    fireEvent.change(screen.getByLabelText(/category name/i), {
      target: { value: 'Investments' },
    });

    fireEvent.click(screen.getByTestId('save-button'));

    // Wait for the new category to appear
    await waitFor(() => {
      expect(screen.getByText('Investments')).toBeInTheDocument();
    });
  });

  it('handles deleting a category', async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Salary' },
      ],
    });

    axiosInstance.delete.mockResolvedValueOnce({
      status: 204,
    });

    render(
      <Router>
        <ViewIncomeCategory />
      </Router>
    );

    // Wait for the categories to load
    await waitFor(() => {
      expect(screen.getByText('Salary')).toBeInTheDocument();
    });

    // Click delete
    fireEvent.click(screen.getByTestId('DeleteIcon'));

    // Confirm deletion in the dialog
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    // Expect the category to be removed
    await waitFor(() => {
      expect(screen.queryByText('Salary')).not.toBeInTheDocument();
    });
  });

  it('handles errors when editing a category', async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Salary' },
      ],
    });

    axiosInstance.put.mockRejectedValueOnce({
      response: {
        data: { name: ['This field is required.'] },
      },
    });

    render(
      <Router>
        <ViewIncomeCategory />
      </Router>
    );

    // Wait for the categories to load
    await waitFor(() => {
      expect(screen.getByText('Salary')).toBeInTheDocument();
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
