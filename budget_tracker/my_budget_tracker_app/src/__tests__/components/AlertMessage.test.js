import React from 'react';
import { render, screen } from '@testing-library/react';
import AlertMessage from '../../components/AlertMessage'; // Adjust the path as necessary
import '@testing-library/jest-dom/extend-expect'; // For better matchers

describe('AlertMessage', () => {
  it('renders error alert with correct message and title', () => {
    // Render component with severity 'error' and a test message
    render(<AlertMessage message="This is an error message" severity="error" />);

    // Check if the alert message and title are displayed correctly
    expect(screen.getByText('This is an error message')).toBeInTheDocument();
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('renders success alert with correct message and title', () => {
    // Render component with severity 'success' and a test message
    render(<AlertMessage message="Operation successful" severity="success" />);

    // Check if the alert message and title are displayed correctly
    expect(screen.getByText('Operation successful')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('applies correct severity class', () => {
    // Render component with severity 'error'
    const { container } = render(<AlertMessage message="Error message" severity="error" />);
    expect(container.querySelector('.MuiAlert-root')).toHaveClass('MuiAlert-standardError');

    // Render component with severity 'success'
    const { container: successContainer } = render(<AlertMessage message="Success message" severity="success" />);
    expect(successContainer.querySelector('.MuiAlert-root')).toHaveClass('MuiAlert-standardSuccess');
  });
});
