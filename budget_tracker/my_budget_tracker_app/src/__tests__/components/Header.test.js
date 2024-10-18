import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

const mockLogout = jest.fn();
const mockNavigate = jest.fn();

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('renders the header with Budget Tracker title and Logout button', () => {
    render(<Header logout={mockLogout} />);

    // Check if the header title is rendered
    expect(screen.getByText(/Budget Tracker/i)).toBeInTheDocument();

    // Check if the logout button is rendered
    expect(screen.getByText(/Logout/i)).toBeInTheDocument();
  });

  it('navigates to home when Budget Tracker title is clicked', () => {
    render(<Header logout={mockLogout} />);

    // Click the title button
    fireEvent.click(screen.getByText(/Budget Tracker/i));

    // Expect navigate to have been called with '/home'
    expect(mockNavigate).toHaveBeenCalledWith('/home');
  });

  it('calls logout and navigates to login when Logout button is clicked', () => {
    render(<Header logout={mockLogout} />);

    // Click the logout button
    fireEvent.click(screen.getByText(/Logout/i));

    // Check if logout is called
    expect(mockLogout).toHaveBeenCalledTimes(1);

    // Check if navigate is called with '/login'
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
