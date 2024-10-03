import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditCreditCardForm from '../../components/EditCreditCardForm';

describe('EditCreditCardForm', () => {
  const mockHandleChange = jest.fn();
  const mockHandleSaveClick = jest.fn();
  const mockHandleCancelClick = jest.fn();
  const formData = {
    last_four_digits: '1234',
    brand: 'Visa',
    expire_date: '2023-12-31',
    credit_limit: 5000,
    payment_day: 15,
    close_card_day: 30,
  };

  beforeEach(() => {
    render(
      <EditCreditCardForm
        formData={formData}
        handleChange={mockHandleChange}
        handleSaveClick={mockHandleSaveClick}
        handleCancelClick={mockHandleCancelClick}
      />
    );
  });

  it('renders all input fields with correct values', () => {
    expect(screen.getByDisplayValue(formData.last_four_digits)).toBeInTheDocument();
    expect(screen.getByDisplayValue(formData.brand)).toBeInTheDocument();
    expect(screen.getByDisplayValue(formData.expire_date)).toBeInTheDocument();
    expect(screen.getByDisplayValue(formData.credit_limit.toString())).toBeInTheDocument();
    expect(screen.getByDisplayValue(formData.payment_day.toString())).toBeInTheDocument();
    expect(screen.getByDisplayValue(formData.close_card_day.toString())).toBeInTheDocument();
  });

  it('calls handleChange when input values change', () => {
    fireEvent.change(screen.getByDisplayValue(formData.last_four_digits), { target: { value: '5678' } });
    expect(mockHandleChange).toHaveBeenCalled();

    fireEvent.change(screen.getByDisplayValue(formData.brand), { target: { value: 'MasterCard' } });
    expect(mockHandleChange).toHaveBeenCalled();

    fireEvent.change(screen.getByDisplayValue(formData.expire_date), { target: { value: '2024-01-01' } });
    expect(mockHandleChange).toHaveBeenCalled();

    fireEvent.change(screen.getByDisplayValue(formData.credit_limit.toString()), { target: { value: '6000' } });
    expect(mockHandleChange).toHaveBeenCalled();

    fireEvent.change(screen.getByDisplayValue(formData.payment_day.toString()), { target: { value: '20' } });
    expect(mockHandleChange).toHaveBeenCalled();

    fireEvent.change(screen.getByDisplayValue(formData.close_card_day.toString()), { target: { value: '25' } });
    expect(mockHandleChange).toHaveBeenCalled();
  });

  it('calls handleSaveClick when save button is clicked', () => {
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(mockHandleSaveClick).toHaveBeenCalled();
  });
  
  it('calls handleCancelClick when cancel button is clicked', () => {
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockHandleCancelClick).toHaveBeenCalled();
  });
});