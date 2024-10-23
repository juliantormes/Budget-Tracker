import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import RegisterForm from '../../views/Register';

// Mock the axios post method
jest.mock('axios');

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
  // Mock localStorage setItem
  jest.spyOn(Storage.prototype, 'setItem');
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks(); // Restore original functionality after each test
});

describe('RegisterForm View', () => {
  it('renders the registration form correctly', () => {
    render(
      <Router>
        <RegisterForm />
      </Router>
    );

    // Check if the title is rendered correctly
    expect(screen.getByRole('heading', { name: /Register/i })).toBeInTheDocument();

    // Ensure that the input fields are present
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
    const passwordInputs = screen.getAllByPlaceholderText(/Password/i);
    expect(passwordInputs.length).toBe(2); // Two password fields (Password & Confirm Password)

    // Check if the register button is present
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  it('validates mismatching passwords', async () => {
    render(
      <Router>
        <RegisterForm />
      </Router>
    );

    // Fill out the form with mismatching passwords
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'testuser' } });
    const passwordInputs = screen.getAllByPlaceholderText(/Password/i);
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } }); // First is the password field
    fireEvent.change(passwordInputs[1], { target: { value: 'password456' } }); // Second is the confirm password field

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    // Expect password mismatch error
    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match. Please try again./i)).toBeInTheDocument();
    });
  });

  it('registers successfully and redirects to home', async () => {
    const mockPost = jest.fn().mockResolvedValueOnce({
      data: { token: 'fake_token' },
    });
    axios.post.mockImplementationOnce(mockPost);

    render(
      <Router>
        <RegisterForm />
      </Router>
    );

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'testuser' } });
    const passwordInputs = screen.getAllByPlaceholderText(/Password/i);
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    // Expect successful registration and token to be saved in localStorage
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(expect.any(String), {
        username: 'testuser',
        password: 'password123',
      });

      // Expect localStorage to have been set with token
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake_token');
    });
  });

  it('displays error on username already taken', async () => {
    const mockPost = jest.fn().mockRejectedValueOnce({
      response: { status: 409 },
    });
    axios.post.mockImplementationOnce(mockPost);

    render(
      <Router>
        <RegisterForm />
      </Router>
    );

    // Fill out the form with an already-taken username
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'takenuser' } });
    const passwordInputs = screen.getAllByPlaceholderText(/Password/i);
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    // Expect error message for username already taken
    await waitFor(() => {
      expect(screen.getByText(/Username already in use. Please choose another./i)).toBeInTheDocument();
    });
  });

  it('displays network error on connection issues', async () => {
    const mockPost = jest.fn().mockRejectedValueOnce(new Error('Network Error'));
    axios.post.mockImplementationOnce(mockPost);

    render(
      <Router>
        <RegisterForm />
      </Router>
    );

    // Fill out the form
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'testuser' } });
    const passwordInputs = screen.getAllByPlaceholderText(/Password/i);
    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Register/i }));

    // Expect network error message
    await waitFor(() => {
      expect(screen.getByText(/Unable to connect to the server. Check your network connection./i)).toBeInTheDocument();
    });
  });
});
