import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import IncomeForm from '../../components/IncomeForm';

describe('IncomeForm', () => {
  const mockHandleChange = jest.fn();
  const mockHandleSubmit = jest.fn((e) => e.preventDefault()); // Prevent form submission for the test
  
  const categories = [
    { id: 'salary', name: 'Salary' },
    { id: 'freelance', name: 'Freelance' },
  ];
  
  const formData = {
    category: 'salary',
    date: '2023-10-01',
    amount: '5000',
    description: 'Freelance work',
    is_recurring: true,
  };
  
  const errors = {
    category: '',
    date: '',
    amount: '',
    description: '',
  };

  beforeEach(() => {
    render(
      <IncomeForm
        formData={formData}
        categories={categories}
        handleChange={mockHandleChange}
        handleSubmit={mockHandleSubmit}
        errors={errors}
      />
    );
  });

  it('renders all input fields correctly', () => {
    // Check that all input fields are rendered
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Recurring Income/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Income/i })).toBeInTheDocument();
  });
  it('calls handleSubmit when the form is submitted', () => {
    fireEvent.submit(screen.getByRole('button', { name: /Add Income/i }));
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it('displays validation errors when fields are invalid', () => {
    const errorState = {
      category: 'Category is required',
      date: 'Date is required',
      amount: 'Amount is required',
    };

    render(
      <IncomeForm
        formData={formData}
        categories={categories}
        handleChange={mockHandleChange}
        handleSubmit={mockHandleSubmit}
        errors={errorState}
      />
    );

    // Check if error messages are displayed
    expect(screen.getByText(/Category is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Date is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Amount is required/i)).toBeInTheDocument();
  });
});
