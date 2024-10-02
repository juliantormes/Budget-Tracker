import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CreditCardForm from '../../components/CreditCardForm'; // Adjust the path accordingly

describe('CreditCardForm Component', () => {
  const mockHandleChange = jest.fn();
  const mockHandleSubmit = jest.fn();
  const defaultFormData = {
    last_four_digits: '',
    brand: '',
    expire_date: '',
    credit_limit: '',
    payment_day: '',
    close_card_day: '',
  };
  const defaultErrors = {
    last_four_digits: '',
    brand: '',
    expire_date: '',
    credit_limit: '',
    payment_day: '',
    close_card_day: '',
  };

  it('renders all input fields', () => {
    render(
      <CreditCardForm
        formData={defaultFormData}
        handleChange={mockHandleChange}
        handleSubmit={mockHandleSubmit}
        errors={defaultErrors}
      />
    );

    // Check if all input fields are rendered
    expect(screen.getByLabelText(/last four digits/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/brand/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expiration date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/credit limit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/payment day/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/close card day/i)).toBeInTheDocument();

    // Check if the submit button is rendered
    expect(screen.getByRole('button', { name: /add credit card/i })).toBeInTheDocument();
  });

  it('allows user to fill in the form and submit', () => {
    render(
      <CreditCardForm
        formData={defaultFormData}
        handleChange={mockHandleChange}
        handleSubmit={mockHandleSubmit}
        errors={defaultErrors}
      />
    );

    // Simulate user input
    fireEvent.change(screen.getByLabelText(/last four digits/i), {
      target: { value: '1234' },
    });
    fireEvent.change(screen.getByLabelText(/brand/i), {
      target: { value: 'Visa' },
    });
    fireEvent.change(screen.getByLabelText(/expiration date/i), {
      target: { value: '2025-10-01' },
    });
    fireEvent.change(screen.getByLabelText(/credit limit/i), {
      target: { value: '5000' },
    });
    fireEvent.change(screen.getByLabelText(/payment day/i), {
      target: { value: '5' },
    });
    fireEvent.change(screen.getByLabelText(/close card day/i), {
      target: { value: '25' },
    });

    // Simulate form submission
    fireEvent.click(screen.getByRole('button', { name: /add credit card/i }));

    // Check if the handleChange and handleSubmit were called
    expect(mockHandleChange).toHaveBeenCalledTimes(6); // One call for each input field
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1); // Submit form
  });

  it('displays error messages for invalid input', () => {
    const errorMessages = {
      last_four_digits: 'Last four digits are required',
      brand: 'Brand is required',
      expire_date: 'Expiration date is required',
      credit_limit: 'Credit limit is required',
      payment_day: 'Payment day is required',
      close_card_day: 'Close card day is required',
    };

    render(
      <CreditCardForm
        formData={defaultFormData}
        handleChange={mockHandleChange}
        handleSubmit={mockHandleSubmit}
        errors={errorMessages}
      />
    );

    // Check if error messages are displayed
    expect(screen.getByText(/last four digits are required/i)).toBeInTheDocument();
    expect(screen.getByText(/brand is required/i)).toBeInTheDocument();
    expect(screen.getByText(/expiration date is required/i)).toBeInTheDocument();
    expect(screen.getByText(/credit limit is required/i)).toBeInTheDocument();
    expect(screen.getByText(/payment day is required/i)).toBeInTheDocument();
    expect(screen.getByText(/close card day is required/i)).toBeInTheDocument();
  });
});
