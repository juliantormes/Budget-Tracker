import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import IncomeTable from '../../components/IncomeTable';

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

const incomes = [
  { id: 1, category: 'Salary', date: '2024-10-01', amount: 5000, description: 'October Salary', is_recurring: true },
  { id: 2, category: 'Bonus', date: '2024-10-15', amount: 1000, description: 'Yearly Bonus', is_recurring: false },
];

const categories = [
  { id: 'salary', name: 'Salary' },
  { id: 'bonus', name: 'Bonus' },
];

describe('IncomeTable Component', () => {
  it('renders the correct number of rows based on incomes', () => {
    render(
      <IncomeTable
        incomes={incomes}
        editingIncomeId={null}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onUpdateRecurring={mockOnUpdateRecurring}
        categories={categories}
      />
    );

    const rows = screen.getAllByTestId('editable-row');
    expect(rows).toHaveLength(incomes.length);
  });

  it('passes the correct props to EditableRow', () => {
    render(
      <IncomeTable
        incomes={incomes}
        editingIncomeId={1}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onUpdateRecurring={mockOnUpdateRecurring}
        categories={categories}
      />
    );

    // Ensure EditableRow is called with the correct props
    incomes.forEach((income) => {
      expect(screen.getByTestId(`edit-button-${income.id}`)).toBeInTheDocument();
    });
  });

  it('calls onEdit when edit button is clicked in EditableRow', () => {
    render(
      <IncomeTable
        incomes={incomes}
        editingIncomeId={null}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
        onSave={mockOnSave}
        onDelete={mockOnDelete}
        onUpdateRecurring={mockOnUpdateRecurring}
        categories={categories}
      />
    );

    // Simulate the onEdit function being called in EditableRow
    fireEvent.click(screen.getByTestId('edit-button-1')); // Simulate click on the first row

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(incomes[0]);
  });
});
