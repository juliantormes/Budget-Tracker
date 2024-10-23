import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import axiosInstance from '../../api/axiosApi';
import ViewCreditCard from '../../views/ViewCreditCard';
import { useAuth } from '../../hooks/useAuth';

// Mock axios instance
jest.mock('../../api/axiosApi');

// Mock the useAuth hook
jest.mock('../../hooks/useAuth');

// Mock ResizeObserver
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

describe('ViewCreditCard View', () => {
  it('renders the credit cards correctly', async () => {
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          last_four_digits: '1234',
          brand: 'Visa',
          expire_date: '12/24',
          credit_limit: 5000,
          payment_day: '15',
          close_card_day: '10',
        },
      ],
    });

    render(
      <Router>
        <ViewCreditCard />
      </Router>
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('1234')).toBeInTheDocument();
      expect(screen.getByText('Visa')).toBeInTheDocument();
      expect(screen.getByText('12/24')).toBeInTheDocument();
      expect(screen.getByText('5000')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });
  });

  it('handles editing a credit card', async () => {
    // Mock API responses
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          last_four_digits: '1234',
          brand: 'Visa',
          expire_date: '12/24',
          credit_limit: 5000,
          payment_day: '15',
          close_card_day: '10',
        },
      ],
    });
    axiosInstance.put.mockResolvedValueOnce({
      status: 200,
      data: {
        id: 1,
        last_four_digits: '1234',
        brand: 'MasterCard',
        expire_date: '12/25',
        credit_limit: 6000,
        payment_day: '20',
        close_card_day: '15',
      },
    });
  
    render(
      <Router>
        <ViewCreditCard />
      </Router>
    );
  
    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('1234')).toBeInTheDocument();
    });
  
    // Click on the edit button by targeting the `data-testid` of the `EditIcon`
    fireEvent.click(screen.getByTestId('EditIcon'));
  
    // Change the form inputs using `data-testid`
    fireEvent.change(screen.getByTestId('credit-card-brand').querySelector('input'), {
        target: { value: 'MasterCard' }
      });
      fireEvent.change(screen.getByTestId('credit-card-expire-date').querySelector('input'), {
        target: { value: '12/25' }
      });
      fireEvent.change(screen.getByTestId('credit-card-limit').querySelector('input'), {
        target: { value: '6000' }
      });
      fireEvent.change(screen.getByTestId('credit-card-payment-day').querySelector('input'), {
        target: { value: '20' }
      });
      fireEvent.change(screen.getByTestId('credit-card-close-day').querySelector('input'), {
        target: { value: '15' }
      });
      
  
    // Click save button
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
  
    // Wait for the save action to complete and expect the updated data
    await waitFor(() => {
      expect(screen.getByText('MasterCard')).toBeInTheDocument();
      expect(screen.getByText('6000')).toBeInTheDocument();
    });
  });
  

  it('opens delete confirmation dialog and deletes a credit card', async () => {
    // Mock API responses
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          last_four_digits: '1234',
          brand: 'Visa',
          expire_date: '12/24',
          credit_limit: 5000,
          payment_day: '15',
          close_card_day: '10',
        },
      ],
    });
    axiosInstance.delete.mockResolvedValueOnce({
      status: 204,
    });

    render(
      <Router>
        <ViewCreditCard />
      </Router>
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('1234')).toBeInTheDocument();
    });

    // Click on the delete button by targeting the `data-testid` of the `DeleteIcon`
    fireEvent.click(screen.getByTestId('DeleteIcon'));

    // Confirm that the delete dialog appears
    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to delete this credit card/i)).toBeInTheDocument();
    });

    // Click delete in the dialog
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    // Expect the card to be removed
    await waitFor(() => {
      expect(screen.queryByText('1234')).not.toBeInTheDocument();
    });
  });

  it('handles error when deleting a credit card', async () => {
    // Mock API responses
    axiosInstance.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          last_four_digits: '1234',
          brand: 'Visa',
          expire_date: '12/24',
          credit_limit: 5000,
          payment_day: '15',
          close_card_day: '10',
        },
      ],
    });
    axiosInstance.delete.mockRejectedValueOnce(new Error('Failed to delete credit card'));

    render(
      <Router>
        <ViewCreditCard />
      </Router>
    );

    // Wait for the data to load
    await waitFor(() => {
      expect(screen.getByText('1234')).toBeInTheDocument();
    });

    // Click on the delete button by targeting the `data-testid` of the `DeleteIcon`
    fireEvent.click(screen.getByTestId('DeleteIcon'));

    // Confirm that the delete dialog appears
    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to delete this credit card/i)).toBeInTheDocument();
    });

    // Click delete in the dialog
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    // Expect the error message to be shown
    await waitFor(() => {
      expect(screen.getByText(/Failed to delete credit card. Please try again./i)).toBeInTheDocument();
    });
  });
});
