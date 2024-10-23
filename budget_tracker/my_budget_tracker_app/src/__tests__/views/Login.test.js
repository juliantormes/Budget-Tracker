import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import LoginForm from '../../views/Login';
import { useAuth } from '../../hooks/useAuth';

// Mock the necessary modules
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
  useAuth.mockReturnValue({ login: jest.fn() });
});

describe('LoginForm View', () => {
  it('renders the login form correctly', () => {
    render(
      <Router>
        <LoginForm />
      </Router>
    );

    // Check if the title is rendered correctly
    expect(screen.getByRole('heading', { name: /Login/i })).toBeInTheDocument();

    // Ensure that the input fields are present
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    
    // Check if the login button is present
    expect(screen.getByRole('button', { name: /Log In/i })).toBeInTheDocument();
  });

  it('validates empty form submission', async () => {
    render(
      <Router>
        <LoginForm />
      </Router>
    );

    // Try submitting the form without filling the fields
    fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

    // Expect validation error
    await waitFor(() => {
      expect(screen.getByText(/Username and password are required./i)).toBeInTheDocument();
    });
  });

  it('logs in successfully and redirects to home', async () => {
    const mockLogin = jest.fn().mockResolvedValueOnce();
    useAuth.mockReturnValue({ login: mockLogin });

    render(
      <Router>
        <LoginForm />
      </Router>
    );

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

    // Expect successful login and redirection
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  it('displays error on invalid credentials', async () => {
    const mockLogin = jest.fn().mockRejectedValueOnce({
      response: { status: 401 },
    });
    useAuth.mockReturnValue({ login: mockLogin });

    render(
      <Router>
        <LoginForm />
      </Router>
    );

    // Fill out the form with invalid credentials
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'wrongpassword' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

    // Expect error message
    await waitFor(() => {
      expect(screen.getByText(/Invalid username or password. Please try again./i)).toBeInTheDocument();
    });
  });

  it('displays network error on connection issues', async () => {
    const mockLogin = jest.fn().mockRejectedValueOnce(new Error('Network Error'));
    useAuth.mockReturnValue({ login: mockLogin });

    render(
      <Router>
        <LoginForm />
      </Router>
    );

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Log In/i }));

    // Expect network error message
    await waitFor(() => {
      expect(screen.getByText(/Unable to connect to the server. Check your network connection./i)).toBeInTheDocument();
    });
  });
});
