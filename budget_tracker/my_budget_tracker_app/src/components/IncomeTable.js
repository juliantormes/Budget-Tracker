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
  onUpdateRecurring,
  categories
}) => (
  <Table className="table">
    <TableHead>
      <TableRow className="table-header">
        <TableCell style={{ color: '#ffffff', fontWeight: 'bold', width: '20%' }}>Category</TableCell>
        <TableCell style={{ color: '#ffffff', fontWeight: 'bold', width: '15%' }}>Date</TableCell>
        <TableCell style={{ color: '#ffffff', fontWeight: 'bold', width: '10%' }}>Amount</TableCell>
        <TableCell style={{ color: '#ffffff', fontWeight: 'bold', width: '35%' }}>Description</TableCell>
        <TableCell style={{ color: '#ffffff', fontWeight: 'bold', width: '10%' }}>Recurring</TableCell>
        <TableCell style={{ color: '#ffffff', fontWeight: 'bold', width: '10%' }}>Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {incomes.map((income) => (
        <EditableRow
          key={`${income.id}-${income.amount}`}  // Add amount in the key to force re-render
          item={income}
          isEditing={editingIncomeId === income.id}
          onEdit={onEdit}
          onCancel={onCancel}
          onSave={onSave}
          onDelete={onDelete}
          onUpdateRecurring={onUpdateRecurring}
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
  onUpdateRecurring: PropTypes.func.isRequired,
  categories: PropTypes.array.isRequired,
};

export default IncomeTable;
