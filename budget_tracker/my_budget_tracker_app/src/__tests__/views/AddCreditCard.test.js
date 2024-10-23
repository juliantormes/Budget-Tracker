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
  import { BrowserRouter as Router } from 'react-router-dom'; // Import the Router
  import AddCreditCard from '../../views/AddCreditCard';
  import axiosInstance from '../../api/axiosApi';
  import { useAuth } from '../../hooks/useAuth';
  
  // Mock the necessary modules
  jest.mock('../../api/axiosApi');
  jest.mock('../../hooks/useAuth');
  
  beforeEach(() => {
    jest.clearAllMocks(); // Reset mock functions before each test
  
    // Properly mock the `useAuth` hook to return a `logout` function
    useAuth.mockReturnValue({
      logout: jest.fn(),
    });
  });
  
  describe('AddCreditCard View', () => {
    it('renders the form correctly', () => {
      render(
        <Router>
          <AddCreditCard /> {/* Wrap component in Router */}
        </Router>
      );
  
      // Test for the form elements
      expect(screen.getByRole('heading', { name: /Add Credit Card/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add Credit Card/i })).toBeInTheDocument();
    });
  
    it('submits the form and displays success message on successful submission', async () => {
        // Mock the API response
        axiosInstance.post.mockResolvedValueOnce({ status: 201 });
      
        render(
          <Router>
            <AddCreditCard /> {/* Wrap in Router */}
          </Router>
        );
      
        // Use getByPlaceholderText or other queries as a fallback
        fireEvent.change(screen.getByLabelText(/last four digits/i), { target: { value: '1234' } });
        fireEvent.change(screen.getByLabelText(/brand/i), { target: { value: 'Visa' } });
        fireEvent.change(screen.getByLabelText(/expiration date/i), { target: { value: '12/24' } });
        fireEvent.change(screen.getByLabelText(/credit limit/i), { target: { value: '5000' } });
        fireEvent.change(screen.getByLabelText(/payment day/i), { target: { value: '15' } });
        fireEvent.change(screen.getByLabelText(/close card day/i), { target: { value: '10' } });
      
        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /Add Credit Card/i }));
      
        // Wait for success message
        await waitFor(() => {
          expect(screen.getByText('Credit card added successfully')).toBeInTheDocument();
        });
      });
      
  
    it('displays error message when submission fails with validation errors', async () => {
      // Mock the API response with validation error
      axiosInstance.post.mockRejectedValueOnce({
        response: {
          data: {
            last_four_digits: ['This field is required.'],
          },
        },
      });
  
      render(
        <Router>
          <AddCreditCard /> {/* Wrap component in Router */}
        </Router>
      );
  
      // Fill out the form with missing data
      fireEvent.change(screen.getByLabelText(/last four digits/i), { target: { value: '' } });
      fireEvent.change(screen.getByLabelText(/brand/i), { target: { value: 'Visa' } });
      fireEvent.change(screen.getByLabelText(/expiration date/i), { target: { value: '12/24' } });
      fireEvent.change(screen.getByLabelText(/credit limit/i), { target: { value: '5000' } });
      fireEvent.change(screen.getByLabelText(/payment day/i), { target: { value: '15' } });
      fireEvent.change(screen.getByLabelText(/close card day/i), { target: { value: '10' } });
  
      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /Add Credit Card/i }));
  
      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/This field is required/i)).toBeInTheDocument();
      });
    });
  
    it('displays general error message on unexpected error', async () => {
      // Mock a network error
      axiosInstance.post.mockRejectedValueOnce(new Error('Network Error'));
  
      render(
        <Router>
          <AddCreditCard /> {/* Wrap component in Router */}
        </Router>
      );
  
      // Fill out the form
      fireEvent.change(screen.getByLabelText(/last four digits/i), { target: { value: '1234' } });
      fireEvent.change(screen.getByLabelText(/brand/i), { target: { value: 'Visa' } });
      fireEvent.change(screen.getByLabelText(/expiration date/i), { target: { value: '12/24' } });
      fireEvent.change(screen.getByLabelText(/credit limit/i), { target: { value: '5000' } });
      fireEvent.change(screen.getByLabelText(/payment day/i), { target: { value: '15' } });
      fireEvent.change(screen.getByLabelText(/close card day/i), { target: { value: '10' } });
  
      // Submit the form
      fireEvent.click(screen.getByRole('button', { name: /Add Credit Card/i }));
  
      // Wait for general error message
      await waitFor(() => {
        expect(screen.getByText(/An unexpected error occurred/i)).toBeInTheDocument();
      });
    });
  });
  
