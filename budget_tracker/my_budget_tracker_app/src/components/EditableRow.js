import React, { useState, useEffect } from 'react';
import { TableCell, TableRow, TextField, IconButton, MenuItem, Select, FormControl } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import dayjs from 'dayjs';
import ConfirmAction from './ConfirmAction';

const EditableRow = ({ item = {}, isEditing, onEdit, onCancel, onSave, onDelete, categories, type, showType }) => {
  const [formData, setFormData] = useState({ ...item });
  const [confirmActionOpen, setConfirmActionOpen] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    if (isEditing) {
      setFormData({ ...item });
    }
  }, [isEditing, item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (event) => {
    setFormData({ ...formData, category: event.target.value });
  };

  const handleActionConfirm = () => {
    if (actionType === 'delete') {
      onDelete(item.id);
    } else if (actionType === 'edit') {
      onSave(formData);
    }
    setConfirmActionOpen(false);
  };

  const openConfirmDialog = (type) => {
    setActionType(type);
    setConfirmActionOpen(true);
  };

  const currentCategory = categories.find((category) => category.id === formData.category)?.name || 'N/A';
  const expenseType = formData.credit_card ? <CreditCardIcon /> : <AttachMoneyIcon />;

  return (
    <>
      <TableRow key={item.id} className={isEditing ? 'editing' : ''}>
        <TableCell>
          {isEditing ? (
            <FormControl fullWidth>
              <Select
                name="category"
                value={formData.category || ''}
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
              value={formData.date ? dayjs(formData.date).format('YYYY-MM-DD') : ''}
              onChange={handleChange}
              fullWidth
            />
          ) : (
            formData.date ? dayjs(formData.date).format('YYYY-MM-DD') : 'N/A'
          )}
        </TableCell>
        <TableCell>
          {isEditing ? (
            <TextField
              name="amount"
              type="number"
              value={formData.amount || ''}
              onChange={handleChange}
              fullWidth
            />
          ) : (
            formData.amount !== undefined ? formData.amount : 'N/A'
          )}
        </TableCell>
        {showType && (
          <TableCell>
            {expenseType}
          </TableCell>
        )}
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
              <IconButton onClick={() => onEdit(item)}>
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
        message={actionType === 'delete' ? `Are you sure you want to delete this ${type}?` : `Are you sure you want to save changes to this ${type}?`}
      />
    </>
  );
};

export default EditableRow;
