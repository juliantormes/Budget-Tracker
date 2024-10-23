beforeAll(() => {
    global.ResizeObserver = class {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });
  
  import React from 'react';
  import { render, screen, fireEvent, waitFor } from '@testing-library/react';
  import { BrowserRouter as Router } from 'react-router-dom'; // Import Router for wrapping the component
  import axiosInstance from '../../api/axiosApi';
  import AddExpenses from '../../views/AddExpenses';
  import { useAuth } from '../../hooks/useAuth';
  
  // Mock the necessary modules
  jest.mock('../../api/axiosApi');
  jest.mock('../../hooks/useAuth');
  
  beforeEach(() => {
    jest.clearAllMocks(); // Clear all mocks before each test
    useAuth.mockReturnValue({ logout: jest.fn() }); // Mock `useAuth` to return a logout function
  });
  
  describe('AddExpenses View', () => {
    it('renders the form correctly', async () => {
      // Mock the API responses
      axiosInstance.get.mockResolvedValueOnce({ data: ['Category 1', 'Category 2'] }); // For categories
      axiosInstance.get.mockResolvedValueOnce({ data: ['CreditCard 1', 'CreditCard 2'] }); // For credit cards
  
      render(
        <Router>
          <AddExpenses />
        </Router>
      );
  
      // Check if the title is rendered correctly
      expect(screen.getByRole('heading', { name: /Add Expenses/i })).toBeInTheDocument();
  
      // Ensure that the form has been rendered
      await waitFor(() => {
        expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
      });
  
      // Check for Installments after clicking "Paid with Credit Card"
      fireEvent.click(screen.getByLabelText(/Paid with Credit Card/i));
      await waitFor(() => {
        expect(screen.getByLabelText(/Installments/i)).toBeInTheDocument();
      });
    });
  
    it('displays error when recurring expenses have more than 1 installment', async () => {
      // Mock the API responses for categories and credit cards
      axiosInstance.get.mockResolvedValueOnce({ data: ['Category 1', 'Category 2'] });
      axiosInstance.get.mockResolvedValueOnce({ data: ['CreditCard 1', 'CreditCard 2'] });
  
      render(
        <Router>
          <AddExpenses />
        </Router>
      );
  
      // Fill out the form
      fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '100' } });
      fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Expense' } });
      fireEvent.click(screen.getByLabelText(/Recurring Expense/i)); // Set recurring
      fireEvent.click(screen.getByLabelText(/Paid with Credit Card/i)); // Enable credit card payment
      fireEvent.change(screen.getByLabelText(/Installments/i), { target: { value: '2' } }); // Set installments > 1
  
      // Submit the form using data-testid
      fireEvent.click(screen.getByTestId('submit-expense'));
  
      // Expect validation error for recurring expense with more than 1 installment
      await waitFor(() => {
        expect(screen.getByText(/Recurring expenses cannot have more than 1 installment/i)).toBeInTheDocument();
      });
    });
  
    it('submits the form and displays success message on successful submission', async () => {
      // Mock the API responses for categories and credit cards
      axiosInstance.get.mockResolvedValueOnce({ data: ['Category 1', 'Category 2'] });
      axiosInstance.get.mockResolvedValueOnce({ data: ['CreditCard 1', 'CreditCard 2'] });
  
      // Mock successful expense submission
      axiosInstance.post.mockResolvedValueOnce({ status: 201 });
  
      render(
        <Router>
          <AddExpenses />
        </Router>
      );
  
      // Fill out the form
      fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '100' } });
      fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Expense' } });
      fireEvent.click(screen.getByLabelText(/Paid with Credit Card/i)); // Enable credit card payment
      fireEvent.change(screen.getByLabelText(/Installments/i), { target: { value: '1' } }); // Set valid installments
  
      // Submit the form using data-testid
      fireEvent.click(screen.getByTestId('submit-expense'));
  
      // Expect success message
      await waitFor(() => {
        expect(screen.getByText(/Expense added successfully!/i)).toBeInTheDocument();
      });
    });
  
    it('displays error message on failed submission due to API error', async () => {
      // Mock the API responses for categories and credit cards
      axiosInstance.get.mockResolvedValueOnce({ data: ['Category 1', 'Category 2'] });
      axiosInstance.get.mockResolvedValueOnce({ data: ['CreditCard 1', 'CreditCard 2'] });
  
      // Mock an API failure
      axiosInstance.post.mockRejectedValueOnce({
        response: {
          data: {
            amount: ['This field is required.'],
          },
        },
      });
  
      render(
        <Router>
          <AddExpenses />
        </Router>
      );
  
      // Fill out the form
      fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Expense' } });
  
      // Submit the form using data-testid
      fireEvent.click(screen.getByTestId('submit-expense'));
  
      // Expect error message from API
      await waitFor(() => {
        expect(screen.getByText(/Error adding expense. Please check the fields./i)).toBeInTheDocument();
        expect(screen.getByText(/This field is required./i)).toBeInTheDocument();
      });
    });
  
    it('displays general error message on unexpected error', async () => {
      // Mock the API responses for categories and credit cards
      axiosInstance.get.mockResolvedValueOnce({ data: ['Category 1', 'Category 2'] });
      axiosInstance.get.mockResolvedValueOnce({ data: ['CreditCard 1', 'CreditCard 2'] });
  
      // Mock a network error
      axiosInstance.post.mockRejectedValueOnce(new Error('Network Error'));
  
      render(
        <Router>
          <AddExpenses />
        </Router>
      );
  
      // Fill out the form
      fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '100' } });
      fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Expense' } });
  
      // Submit the form using data-testid
      fireEvent.click(screen.getByTestId('submit-expense'));
  
      // Expect general error message
      await waitFor(() => {
        expect(screen.getByText(/An unexpected error occurred. Please try again./i)).toBeInTheDocument();
      });
    });
  });
  