import { render, screen, waitFor } from '@testing-library/react';
import { ProvideAuth, useAuth } from '../../hooks/useAuth';  // Adjust this path
import axios from 'axios';
import userEvent from '@testing-library/user-event';

// Mock axios
jest.mock('axios');

// Test component to use the hook
function TestComponent() {
    const { user, login, logout } = useAuth();

    return (
        <div>
            <span>{user ? `Logged in as: ${user.username}` : 'Not logged in'}</span>
            <button onClick={() => login('testuser', 'password')}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
}

describe('useAuth Hook with context', () => {
    afterEach(() => {
        jest.clearAllMocks();
        localStorage.clear(); // Clear localStorage after each test
    });

    it('should login a user and store the token', async () => {
        const mockToken = 'mock-token';
        axios.post.mockResolvedValueOnce({ data: { token: mockToken } });

        render(
            <ProvideAuth>
                <TestComponent />
            </ProvideAuth>
        );

        const loginButton = screen.getByText('Login');
        userEvent.click(loginButton);

        await waitFor(() => {
            // Check if axios was called with the correct data
            expect(axios.post).toHaveBeenCalledWith(`${process.env.REACT_APP_API_BASE_URL}login/`, {
                username: 'testuser',
                password: 'password',
            });

            // Check that token was set in localStorage
            expect(localStorage.getItem('token')).toBe(mockToken);

            // Check if user is shown as logged in
            expect(screen.getByText('Logged in as: testuser')).toBeInTheDocument();
        });
    });

    it('should logout a user and remove the token', async () => {
        localStorage.setItem('token', 'existing-token');

        render(
            <ProvideAuth>
                <TestComponent />
            </ProvideAuth>
        );

        const logoutButton = screen.getByText('Logout');
        userEvent.click(logoutButton);

        // Check that token was removed from localStorage
        await waitFor(() => expect(localStorage.getItem('token')).toBeNull());

        // Check that user state is reset to not logged in
        expect(screen.getByText('Not logged in')).toBeInTheDocument();
    });

    it('should initialize with a token if found in localStorage', async () => {
        localStorage.setItem('token', 'existing-token');

        render(
            <ProvideAuth>
                <TestComponent />
            </ProvideAuth>
        );

        // Check if the user is initialized based on the token in localStorage
        expect(screen.getByText('Logged in as: dummy')).toBeInTheDocument();
    });
});
