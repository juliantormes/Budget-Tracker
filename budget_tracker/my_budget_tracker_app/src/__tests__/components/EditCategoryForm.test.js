import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditCategoryForm from '../../components/EditCategoryForm'; // Adjust the path based on your project structure

describe('EditCategoryForm', () => {
  const mockHandleChange = jest.fn();
  const mockHandleSave = jest.fn();
  const mockHandleCancel = jest.fn();

  const formData = {
    name: 'Groceries',
  };

  beforeEach(() => {
    render(
      <EditCategoryForm
        formData={formData}
        handleChange={mockHandleChange}
        handleSave={mockHandleSave}
        handleCancel={mockHandleCancel}
        errors={{}} // No errors initially
      />
    );
  });

  it('renders the input field and buttons', () => {
    // Check if the text input is rendered by its label
    expect(screen.getAllByLabelText(/Category Name/i).length).toBeGreaterThan(0);

    // Check if the Save and Cancel buttons are rendered using their test ids
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
    expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
  });

  it('calls handleSave when the Save button is clicked', () => {
    // Simulate clicking the Save button using data-testid
    fireEvent.click(screen.getByTestId('save-button'));

    // Check if the handleSave function is called
    expect(mockHandleSave).toHaveBeenCalled();
  });

  it('calls handleCancel when the Cancel button is clicked', () => {
    // Simulate clicking the Cancel button using data-testid
    fireEvent.click(screen.getByTestId('cancel-button'));

    // Check if the handleCancel function is called
    expect(mockHandleCancel).toHaveBeenCalled();
  });
});
