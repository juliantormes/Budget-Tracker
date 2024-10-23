import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import axiosInstance from '../../api/axiosApi';
import AddIncomes from '../../views/AddIncomes';
import { useAuth } from '../../hooks/useAuth';

// Mock the necessary modules
jest.mock('../../api/axiosApi');
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
  useAuth.mockReturnValue({ logout: jest.fn() });
});

describe('AddIncomes View', () => {
  it('renders the form correctly', async () => {
    // Mock the API response for categories
    axiosInstance.get.mockResolvedValueOnce({ data: ['Category 1', 'Category 2'] });

    render(
      <Router>
        <AddIncomes />
      </Router>
    );

    // Check if the title is rendered correctly
    expect(screen.getByRole('heading', { name: /Add Income/i })).toBeInTheDocument();

    // Ensure that the form has been rendered
    await waitFor(() => {
      expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Recurring Income/i)).toBeInTheDocument();
    });
  });

  it('displays success message on successful income submission', async () => {
    // Mock the API responses for categories and successful income submission
    axiosInstance.get.mockResolvedValueOnce({ data: ['Category 1', 'Category 2'] });
    axiosInstance.post.mockResolvedValueOnce({ status: 201 });

    render(
      <Router>
        <AddIncomes />
      </Router>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Income' } });

    // Open the category dropdown
    fireEvent.mouseDown(screen.getByLabelText(/Category/i));

    // Select an option from the dropdown
    fireEvent.click(screen.getByText('Category'));

    // Submit the form
    fireEvent.click(screen.getByTestId('submit-income'));

    // Expect success message
    await waitFor(() => {
      expect(screen.getByText(/Income added successfully!/i)).toBeInTheDocument();
    });
  });

  it('displays error message on failed submission due to API error', async () => {
    // Mock the API responses for categories and failed income submission
    axiosInstance.get.mockResolvedValueOnce({ data: ['Category 1', 'Category 2'] });
    axiosInstance.post.mockRejectedValueOnce({
      response: {
        data: {
          amount: ['This field is required.'],
        },
      },
    });

    render(
      <Router>
        <AddIncomes />
      </Router>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Income' } });

    // Open the category dropdown
    fireEvent.mouseDown(screen.getByLabelText(/Category/i));

    // Select an option from the dropdown
    fireEvent.click(screen.getByText('Category'));

    // Submit the form
    fireEvent.click(screen.getByTestId('submit-income'));

    // Expect error message from API
    await waitFor(() => {
      expect(screen.getByText(/Error adding income. Please check the fields./i)).toBeInTheDocument();
      expect(screen.getByText(/This field is required./i)).toBeInTheDocument();
    });
  });

  it('displays general error message on unexpected error', async () => {
    // Mock the API responses for categories and network error
    axiosInstance.get.mockResolvedValueOnce({ data: ['Category 1', 'Category 2'] });
    axiosInstance.post.mockRejectedValueOnce(new Error('Network Error'));

    render(
      <Router>
        <AddIncomes />
      </Router>
    );

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test Income' } });

    // Open the category dropdown
    fireEvent.mouseDown(screen.getByLabelText(/Category/i));

    // Select an option from the dropdown
    fireEvent.click(screen.getByText('Category'));

    // Submit the form
    fireEvent.click(screen.getByTestId('submit-income'));

    // Expect general error message
    await waitFor(() => {
      expect(screen.getByText(/An unexpected error occurred. Please try again./i)).toBeInTheDocument();
    });
  });
});
