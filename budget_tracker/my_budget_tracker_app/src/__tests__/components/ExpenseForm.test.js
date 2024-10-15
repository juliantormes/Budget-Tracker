import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExpenseForm from '../../components/ExpenseForm';

describe('ExpenseForm', () => {
  const mockHandleChange = jest.fn();
  const mockHandleSubmit = jest.fn((e) => e.preventDefault());

  const categories = [
    { id: 'groceries', name: 'Groceries' },
    { id: 'utilities', name: 'Utilities' },
  ];

  const creditCards = [
    { id: '1', brand: 'Visa', last_four_digits: '1234' },
    { id: '2', brand: 'MasterCard', last_four_digits: '5678' },
  ];

  const formData = {
    category: 'groceries',
    date: '2023-10-15',
    amount: '100',
    description: 'Weekly groceries',
    is_recurring: false,
    pay_with_credit_card: false,
    credit_card_id: '',
    installments: '',
    surcharge: '',
  };

  const errors = {
    category: '',
    date: '',
    amount: '',
    description: '',
    credit_card_id: '',
    installments: '',
    surcharge: '',
  };

  beforeEach(() => {
    render(
      <ExpenseForm
        formData={formData}
        categories={categories}
        creditCards={creditCards}
        handleChange={mockHandleChange}
        handleSubmit={mockHandleSubmit}
        errors={errors}
      />
    );
  });

  it('renders all necessary input fields', () => {
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Recurring Expense/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Paid with Credit Card/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Expense/i })).toBeInTheDocument();
  });

  it('does not render credit card fields when pay_with_credit_card is false', () => {
    expect(screen.queryByLabelText(/Credit Card/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Installments/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Surcharge/i)).not.toBeInTheDocument();
  });

  it('renders credit card fields when pay_with_credit_card is true', () => {
    // Simulate clicking the "Paid with Credit Card" checkbox
    fireEvent.click(screen.getByLabelText(/Paid with Credit Card/i));

    expect(screen.getByLabelText(/Credit Card/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Installments/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Surcharge/i)).toBeInTheDocument();
  });

  it('displays validation errors when fields are invalid', () => {
    const errorState = {
      category: '',
      date: 'Date is required',
      amount: 'Amount is required',
    };

    render(
      <ExpenseForm
        formData={formData}
        categories={categories}
        creditCards={creditCards}
        handleChange={mockHandleChange}
        handleSubmit={mockHandleSubmit}
        errors={errorState}
      />
    );

    expect(screen.getByText(/Date is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Amount is required/i)).toBeInTheDocument();
  });

  it('calls handleSubmit when the form is submitted', () => {
    fireEvent.submit(screen.getByRole('button', { name: /Add Expense/i }));
    expect(mockHandleSubmit).toHaveBeenCalled();
  });
});
