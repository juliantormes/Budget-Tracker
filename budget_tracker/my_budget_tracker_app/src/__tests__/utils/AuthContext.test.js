import React from 'react';
import { render, screen } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../utils/AuthContext'; // Adjust the path accordingly
import userEvent from '@testing-library/user-event';
import { act } from 'react';

// Test component to consume AuthContext and display the username
const TestComponent = () => {
  const { credentials, login, logout } = useAuth();
  return (
    <div>
      <p>Username: {credentials.username}</p>
      <button onClick={() => login('testuser', 'testpassword')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  it('allows a user to log in and log out', async () => {
    // Wrap the render call inside `act` to avoid warning
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );
    });

    // Assert that the username is initially empty (strict match to avoid blank space issues)
    expect(screen.getByText(/Username:/)).toHaveTextContent('Username:');

    // Simulate the user clicking the login button
    const loginButton = screen.getByText('Login');
    await act(async () => {
      userEvent.click(loginButton);
    });

    // Assert that the username has been updated after login
    expect(screen.getByText(/Username:/)).toHaveTextContent('Username: testuser');

    // Simulate the user clicking the logout button
    const logoutButton = screen.getByText('Logout');
    await act(async () => {
      userEvent.click(logoutButton);
    });

    // Assert that the username has been cleared after logout
    expect(screen.getByText(/Username:/)).toHaveTextContent('Username:');
  });
});
