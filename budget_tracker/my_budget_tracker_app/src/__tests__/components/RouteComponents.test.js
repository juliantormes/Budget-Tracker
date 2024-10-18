import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PrivateRoute, PublicRoute } from '../../components/RouteComponents';
import { useAuth } from '../../hooks/useAuth';

// Mock useAuth hook
jest.mock('../../hooks/useAuth');

describe('PrivateRoute Component', () => {
  it('renders the component if the user is authenticated', () => {
    useAuth.mockReturnValue({ user: { username: 'testUser' } });

    const { getByText } = render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route path="/private" element={<PrivateRoute element={() => <div>Private Content</div>} />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText('Private Content')).toBeInTheDocument();
  });

  it('redirects to login if the user is not authenticated', () => {
    useAuth.mockReturnValue({ user: null });

    const { container } = render(
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route path="/private" element={<PrivateRoute element={() => <div>Private Content</div>} />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(container.innerHTML).toMatch('Login Page'); // Check if the redirection to login happened
  });
});

describe('PublicRoute Component', () => {
  it('renders the component if the user is not authenticated', () => {
    useAuth.mockReturnValue({ user: null });

    const { getByText } = render(
      <MemoryRouter initialEntries={['/public']}>
        <Routes>
          <Route path="/public" element={<PublicRoute element={() => <div>Public Content</div>} />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText('Public Content')).toBeInTheDocument();
  });

  it('redirects to home if the user is authenticated', () => {
    useAuth.mockReturnValue({ user: { username: 'testUser' } });

    const { container } = render(
      <MemoryRouter initialEntries={['/public']}>
        <Routes>
          <Route path="/public" element={<PublicRoute element={() => <div>Public Content</div>} />} />
          <Route path="/home" element={<div>Home Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(container.innerHTML).toMatch('Home Page'); // Check if the redirection to home happened
  });
});
