import React, { useState } from 'react';
import { List, ListItem, ListItemText, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import dayjs from 'dayjs';
import EditIncomeDialog from './EditIncomeDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

const IncomeList = ({ incomes, handleEdit, handleDelete }) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);

  const openEditDialog = (income) => {
    setSelectedIncome(income);
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedIncome(null);
  };

  const openDeleteDialog = (income) => {
    setSelectedIncome(income);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedIncome(null);
  };

  const handleSave = (updatedIncome) => {
    handleEdit(updatedIncome);
    closeEditDialog();
  };

  const handleConfirmDelete = () => {
    handleDelete(selectedIncome.id);
    closeDeleteDialog();
  };

  return (
    <div>
      <List>
        {incomes.map(income => (
          <ListItem key={income.id} className="income-list-item">
            <ListItemText primary={income.category_name} secondary={dayjs(income.date).format('MMMM D, YYYY')} />
            <ListItemText primary={`$${Number(income.amount).toFixed(2)}`} />
            <IconButton onClick={() => openEditDialog(income)}>
              <Edit />
            </IconButton>
            <IconButton onClick={() => openDeleteDialog(income)}>
              <Delete />
            </IconButton>
          </ListItem>
        ))}
      </List>
      {selectedIncome && (
        <EditIncomeDialog
          open={editDialogOpen}
          onClose={closeEditDialog}
          income={selectedIncome}
          onSave={handleSave}
        />
      )}
      {selectedIncome && (
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onClose={closeDeleteDialog}
          onConfirm={handleConfirmDelete}
          incomeId={selectedIncome.id}
        />
      )}
    </div>
  );
};

export default IncomeList;
