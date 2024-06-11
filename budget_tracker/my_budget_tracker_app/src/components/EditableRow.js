import React, { useState, useEffect } from 'react';
import { TableCell, TableRow, TextField, IconButton, MenuItem, Select, FormControl } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';
import ConfirmAction from './ConfirmAction';

const EditableRow = ({ income, isEditing, onEdit, onCancel, onSave, onDelete, categories }) => {
  const [formData, setFormData] = useState({ ...income });
  const [confirmActionOpen, setConfirmActionOpen] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    if (isEditing) {
      setFormData({ ...income });
    }
  }, [isEditing, income]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (event) => {
    setFormData({ ...formData, income_category: event.target.value });
  };

  const handleActionConfirm = () => {
    if (actionType === 'delete') {
      onDelete(income.id);
    } else if (actionType === 'edit') {
      onSave(formData);
    }
    setConfirmActionOpen(false);
  };

  const openConfirmDialog = (type) => {
    setActionType(type);
    setConfirmActionOpen(true);
  };

  const currentCategory = categories.find((category) => category.id === income.income_category?.id)?.name || 'N/A';

  return (
    <>
      <TableRow key={income.id} className={isEditing ? 'editing' : ''}>
        <TableCell>
          {isEditing ? (
            <FormControl fullWidth>
              <Select
                name="income_category"
                value={formData.income_category}
                onChange={handleCategoryChange}
                displayEmpty
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            currentCategory
          )}
        </TableCell>
        <TableCell>
          {isEditing ? (
            <TextField
              name="date"
              type="date"
              value={dayjs(formData.date).format('YYYY-MM-DD')}
              onChange={handleChange}
              fullWidth
            />
          ) : (
            dayjs(income.date).format('YYYY-MM-DD')
          )}
        </TableCell>
        <TableCell>
          {isEditing ? (
            <TextField
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              fullWidth
            />
          ) : (
            income.amount
          )}
        </TableCell>
        <TableCell>
          {isEditing ? (
            <>
              <IconButton onClick={() => openConfirmDialog('edit')}>
                <SaveIcon />
              </IconButton>
              <IconButton onClick={onCancel}>
                <CancelIcon />
              </IconButton>
            </>
          ) : (
            <>
              <IconButton onClick={() => onEdit(income)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => openConfirmDialog('delete')}>
                <DeleteIcon />
              </IconButton>
            </>
          )}
        </TableCell>
      </TableRow>
      <ConfirmAction
        open={confirmActionOpen}
        onClose={() => setConfirmActionOpen(false)}
        onConfirm={handleActionConfirm}
        title={actionType === 'delete' ? 'Confirm Deletion' : 'Confirm Edit'}
        message={actionType === 'delete' ? 'Are you sure you want to delete this income?' : 'Are you sure you want to save changes?'}
      />
    </>
  );
};

export default EditableRow;
