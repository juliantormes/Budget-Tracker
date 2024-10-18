import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ExpenseTable from '../../components/ExpenseTable';

// Mock EditableRow component
jest.mock('../../components/EditableRow', () => (props) => (
  <tr data-testid="editable-row">
    <td>{props.item.category}</td>
    <td>{props.item.amount}</td>
    <button data-testid={`edit-button-${props.item.id}`} onClick={() => props.onEdit(props.item)}>Edit</button>
  </tr>
));

const mockOnEdit = jest.fn();
const mockOnCancel = jest.fn();
const mockOnSave = jest.fn();
const mockOnDelete = jest.fn();
const mockOnUpdateRecurring = jest.fn();

const expenses = [
  { id: 1, category: 'groceries', date: '2024-10-15', amount: 100, description: 'Food', is_recurring: false, pay_with_credit_card: false, installments: 1, surcharge: 0 },
  { id: 2, category: 'utilities', date: '2024-10-16', amount: 200, description: 'Electricity', is_recurring: true, pay_with_credit_card: true, installments: 2, surcharge: 5 },
];

const categories = [
  { id: 'groceries', name: 'Groceries' },
  { id: 'utilities', name: 'Utilities' },
];

const creditCards = [
  { id: '1', brand: 'Visa', last_four_digits: '1234' },
  { id: '2', brand: 'MasterCard', last_four_digits: '5678' },
];

describe('ExpenseTable Component', () => {
  it('renders the correct number of rows based on expenses', () => {
    render(
      <ExpenseTable
        expenses={expenses}
        editingExpenseId={null}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onUpdateRecurring={mockOnUpdateRecurring}
        categories={categories}
        creditCards={creditCards}
        isDeleting={false}
      />
    );

    const rows = screen.getAllByTestId('editable-row');
    expect(rows).toHaveLength(expenses.length);
  });

  it('passes the correct props to EditableRow', () => {
    render(
      <ExpenseTable
        expenses={expenses}
        editingExpenseId={1}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onUpdateRecurring={mockOnUpdateRecurring}
        categories={categories}
        creditCards={creditCards}
        isDeleting={false}
      />
    );

    // Ensure EditableRow is called with the correct props
    expenses.forEach((expense, index) => {
      expect(screen.getByTestId(`edit-button-${expense.id}`)).toBeInTheDocument();
    });
  });

  it('calls onEdit when edit button is clicked in EditableRow', () => {
    render(
      <ExpenseTable
        expenses={expenses}
        editingExpenseId={null}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onUpdateRecurring={mockOnUpdateRecurring}
        categories={categories}
        creditCards={creditCards}
        isDeleting={false}
      />
    );

    // Simulate the onEdit function being called in EditableRow
    fireEvent.click(screen.getByTestId('edit-button-1')); // Simulate click on the first row

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(expenses[0]);
  });
});
