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
  onUpdateRecurring,
  categories,
  creditCards,
  isDeleting
}) => {
  console.log('Rendering ExpenseTable with expenses:', expenses); // Add this log to inspect the data

  return (
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
            key={`${expense.id}-${expense.amount}`}  // Add amount in the key to force re-render
            item={expense}
            isEditing={editingExpenseId === expense.id}
            onEdit={onEdit}
            onCancel={onCancel}
            onSave={onSave}
            onDelete={onDelete}
            onUpdateRecurring={onUpdateRecurring}
            categories={categories}
            type="expense"
            creditCards={creditCards}
            isDeleting={isDeleting}
          />
        ))}
      </TableBody>
    </Table>
  );
};

ExpenseTable.propTypes = {
  expenses: PropTypes.array.isRequired,
  editingExpenseId: PropTypes.number,
  onEdit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdateRecurring: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
  creditCards: PropTypes.array.isRequired,
  isDeleting: PropTypes.bool.isRequired,
};

export default ExpenseTable;
