// IncomeTable.js
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import EditableRow from './EditableRow';
import PropTypes from 'prop-types';

const IncomeTable = ({
  incomes,
  editingIncomeId,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  categories
}) => (
  <Table className="table">
    <TableHead>
      <TableRow className="table-header">
        <TableCell>Category</TableCell>
        <TableCell>Date</TableCell>
        <TableCell>Amount</TableCell>
        <TableCell>Description</TableCell>
        <TableCell>Recurring</TableCell>
        <TableCell>Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {incomes.map((income) => (
        <EditableRow
          key={income.id}
          item={income}
          isEditing={editingIncomeId === income.id}
          onEdit={onEdit}
          onCancel={onCancel}
          onSave={onSave}
          onDelete={onDelete}
          categories={categories}
          type="income"
          showType={false}
        />
      ))}
    </TableBody>
  </Table>
);

IncomeTable.propTypes = {
  incomes: PropTypes.array.isRequired,
  editingIncomeId: PropTypes.number,
  onEdit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
};

export default IncomeTable;
