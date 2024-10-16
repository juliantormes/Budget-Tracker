import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EditableRow from '../../components/EditableRow';
import dayjs from 'dayjs';

const categories = [
  { id: 'groceries', name: 'Groceries' },
  { id: 'utilities', name: 'Utilities' },
];

const creditCards = [
  { id: '1', brand: 'Visa', last_four_digits: '1234' },
  { id: '2', brand: 'MasterCard', last_four_digits: '5678' },
];

const defaultItem = {
  id: 1,
  category: 'groceries',
  date: dayjs().format('YYYY-MM-DD'),
  amount: 100,
  description: 'Sample description',
  is_recurring: false,
  pay_with_credit_card: false,
  installments: 3,
  surcharge: 10,
};

const mockOnEdit = jest.fn();
const mockOnCancel = jest.fn();
const mockOnSave = jest.fn();
const mockOnDelete = jest.fn();
const mockOnUpdateRecurring = jest.fn();

describe('EditableRow Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the row correctly when not editing', () => {
    render(
      <EditableRow
        item={defaultItem}
        categories={categories}
        creditCards={creditCards}
        isEditing={false}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onUpdateRecurring={mockOnUpdateRecurring}
        type="expense"
      />
    );

    expect(screen.getByText(/Groceries/i)).toBeInTheDocument();
    expect(screen.getByText(/Sample description/i)).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();  // amount
  });

  it('renders inputs correctly when editing', () => {
    render(
      <EditableRow
        item={defaultItem}
        categories={categories}
        creditCards={creditCards}
        isEditing={true}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onUpdateRecurring={mockOnUpdateRecurring}
        type="expense"
      />
    );

    expect(screen.getByDisplayValue(/Groceries/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Sample description/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument(); // amount
  });

  it('calls handleInputChange when inputs are changed', () => {
    render(
      <EditableRow
        item={defaultItem}
        categories={categories}
        creditCards={creditCards}
        isEditing={true}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onUpdateRecurring={mockOnUpdateRecurring}
        type="expense"
      />
    );

    const descriptionInput = screen.getByDisplayValue(/Sample description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Updated description' } });
    expect(descriptionInput.value).toBe('Updated description');
  });
  
  it('calls onCancel when Cancel button is clicked', () => {
    render(
      <EditableRow
        item={defaultItem}
        categories={categories}
        creditCards={creditCards}
        isEditing={true}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onUpdateRecurring={mockOnUpdateRecurring}
        type="expense"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onEdit when Edit button is clicked', () => {
    render(
      <EditableRow
        item={defaultItem}
        categories={categories}
        creditCards={creditCards}
        isEditing={false}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onUpdateRecurring={mockOnUpdateRecurring}
        type="expense"
      />
    );

    fireEvent.click(screen.getByTestId('EditIcon')); // Ensure there's a data-testid in your Edit button
    expect(mockOnEdit).toHaveBeenCalledWith(defaultItem);
  });

  it('opens confirm dialog when Delete is clicked', () => {
    render(
      <EditableRow
        item={defaultItem}
        categories={categories}
        creditCards={creditCards}
        isEditing={false}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onUpdateRecurring={mockOnUpdateRecurring}
        type="expense"
      />
    );

    fireEvent.click(screen.getByTestId('DeleteIcon')); // Ensure there's a data-testid in your Delete button
    expect(screen.getByText(/Are you sure you want to delete this expense?/i)).toBeInTheDocument();
  });

  it('calls onUpdateRecurring when Update Recurring button is clicked', () => {
    const recurringItem = { ...defaultItem, is_recurring: true };

    render(
      <EditableRow
        item={recurringItem}
        categories={categories}
        creditCards={creditCards}
        isEditing={false}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onUpdateRecurring={mockOnUpdateRecurring}
        type="expense"
      />
    );

    fireEvent.click(screen.getByTestId('MonetizationOnIcon')); // Add data-testid for MonetizationOnIcon
    expect(mockOnUpdateRecurring).toHaveBeenCalledWith(recurringItem.id);
  });
});
