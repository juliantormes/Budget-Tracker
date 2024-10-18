import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditIncomeDialog from '../../components/EditIncomeDialog';
import dayjs from 'dayjs';

const mockOnSave = jest.fn();
const mockOnClose = jest.fn();

const incomeData = {
  category_name: 'Salary',
  date: '2024-10-15',
  amount: 1000,
};

describe('EditIncomeDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dialog with correct fields', () => {
    render(
      <EditIncomeDialog
        open={true}
        onClose={mockOnClose}
        income={incomeData}
        onSave={mockOnSave}
      />
    );

    // Check that dialog title is present
    expect(screen.getByText(/edit income/i)).toBeInTheDocument();
    
    // Check that the fields are rendered with correct values
    expect(screen.getByLabelText(/Category/i)).toHaveValue(incomeData.category_name);
    expect(screen.getByLabelText(/Date/i)).toHaveValue(dayjs(incomeData.date).format('YYYY-MM-DD'));
    expect(screen.getByLabelText(/Amount/i)).toHaveValue(incomeData.amount);
  });

  it('calls onSave with updated data when Save button is clicked', () => {
    render(
      <EditIncomeDialog
        open={true}
        onClose={mockOnClose}
        income={incomeData}
        onSave={mockOnSave}
      />
    );
  
    // Simulate user changing the category and amount
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: 'Bonus' } });
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: '1500' } }); // Use '1500' as a string
  
    // Click Save button
    fireEvent.click(screen.getByText(/Save/i));
  
    // Ensure onSave is called with the updated formData (with amount as a string)
    expect(mockOnSave).toHaveBeenCalledWith({
      category_name: 'Bonus',
      date: '2024-10-15',
      amount: '1500', // Match string type here
    });
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(
      <EditIncomeDialog
        open={true}
        onClose={mockOnClose}
        income={incomeData}
        onSave={mockOnSave}
      />
    );

    // Click Cancel button
    fireEvent.click(screen.getByText(/Cancel/i));

    // Ensure onClose is called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
