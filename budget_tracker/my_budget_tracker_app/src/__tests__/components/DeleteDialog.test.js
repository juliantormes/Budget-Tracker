import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DeleteDialog from '../../components/DeleteDialog';

describe('DeleteDialog', () => {
  const mockHandleClose = jest.fn();
  const mockHandleConfirm = jest.fn();

  const defaultProps = {
    open: true,
    handleClose: mockHandleClose,
    handleConfirm: mockHandleConfirm,
  };

  beforeEach(() => {
    mockHandleClose.mockClear();
    mockHandleConfirm.mockClear();
  });

  it('renders the dialog with the correct text and buttons', () => {
    render(<DeleteDialog {...defaultProps} />);

    // Check if dialog title and content are rendered
    expect(screen.getByText(/Confirm Delete/i)).toBeInTheDocument();
    expect(screen.getByText(/Are you sure you want to delete this category?/i)).toBeInTheDocument();

    // Check if Confirm and Cancel buttons are rendered
    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });

    expect(confirmButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  it('calls handleConfirm when the Confirm button is clicked', () => {
    render(<DeleteDialog {...defaultProps} />);

    const confirmButton = screen.getByRole('button', { name: /Confirm/i });
    fireEvent.click(confirmButton);

    expect(mockHandleConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls handleClose when the Cancel button is clicked', () => {
    render(<DeleteDialog {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockHandleClose).toHaveBeenCalledTimes(1);
  });
});
