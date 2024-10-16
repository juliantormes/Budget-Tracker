import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExpenseForm from '../../components/ExpenseForm';

// Helper to render the component with state management
const RenderWithState = (initialFormData, categories, creditCards, errors, handleSubmit) => {
  const WrapperComponent = () => {
    const [formData, setFormData] = useState(initialFormData);

    const handleChange = (e) => {
      const { name, value, checked, type } = e.target;
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    };

    return (
      <ExpenseForm
        formData={formData}
        categories={categories}
        creditCards={creditCards}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        errors={errors}
      />
    );
  };

  return render(<WrapperComponent />);
};

describe('ExpenseForm', () => {
  const categories = [
    { id: 'groceries', name: 'Groceries' },
    { id: 'utilities', name: 'Utilities' },
  ];

  const creditCards = [
    { id: '1', brand: 'Visa', last_four_digits: '1234' },
    { id: '2', brand: 'MasterCard', last_four_digits: '5678' },
  ];

  const initialFormData = {
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

  let mockHandleSubmit; // Declare the mock function

  beforeEach(() => {
    mockHandleSubmit = jest.fn(); // Initialize the mock function before each test
    RenderWithState(initialFormData, categories, creditCards, errors, mockHandleSubmit);
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
    expect(screen.getByLabelText(/Paid with Credit Card/i)).toBeInTheDocument();

    expect(screen.queryByRole('combobox', { name: /Credit Card/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Installments/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Surcharge/i)).not.toBeInTheDocument();
  });

  it('renders credit card fields when pay_with_credit_card is true', () => {
    fireEvent.click(screen.getByLabelText(/Paid with Credit Card/i));

    expect(screen.getByLabelText(/Paid with Credit Card/i)).toBeChecked();
    expect(screen.getByRole('combobox', { name: /Credit Card/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Installments/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Surcharge/i)).toBeInTheDocument();
  });

  it('displays validation errors when fields are invalid', () => {
    const errorState = {
      category: '',
      date: 'Date is required',
      amount: 'Amount is required',
    };

    RenderWithState(initialFormData, categories, creditCards, errorState, mockHandleSubmit);

    expect(screen.getByText(/Date is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Amount is required/i)).toBeInTheDocument();
  });

  it('calls handleSubmit when the form is submitted', () => {
    // Use getByTestId to target the specific button
    fireEvent.submit(screen.getByTestId('submit-expense'));

    expect(mockHandleSubmit).toHaveBeenCalled(); // Ensure mockHandleSubmit was called
  });
});
