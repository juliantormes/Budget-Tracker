import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import EditableRow from './EditableRow';
import PropTypes from 'prop-types';

const ExpenseTable = ({
  expenses,
  editingExpenseId,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  categories,
  creditCards
}) => (
  <Table className="table">
    <TableHead>
      <TableRow className="table-header">
        <TableCell>Category</TableCell>
        <TableCell>Date</TableCell>
        <TableCell>Amount</TableCell>
        <TableCell>Description</TableCell>
        <TableCell>Recurring</TableCell>
        <TableCell>Paid with Credit Card</TableCell>
        <TableCell>Credit Card</TableCell>
        <TableCell>Installments</TableCell>
        <TableCell>Surcharge</TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {expenses.map((expense) => (
        <EditableRow
          key={expense.id}
          item={expense}
          isEditing={editingExpenseId === expense.id}
          onEdit={onEdit}
          onCancel={onCancel}
          onSave={onSave}
          onDelete={onDelete}
          categories={categories}
          type="expense"
          creditCards={creditCards}
        />
      ))}
    </TableBody>
  </Table>
);

ExpenseTable.propTypes = {
  expenses: PropTypes.array.isRequired,
  editingExpenseId: PropTypes.number,
  onEdit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
  creditCards: PropTypes.array.isRequired,
};

export default ExpenseTable;
