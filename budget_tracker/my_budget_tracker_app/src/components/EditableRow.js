import React, { useState, useEffect } from 'react';
import { TableCell, TableRow, TextField, IconButton, MenuItem, Select, FormControl, Checkbox } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import dayjs from 'dayjs';
import ConfirmAction from './ConfirmAction';

const EditableRow = ({
  item = {},
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onUpdateRecurring,
  categories = [],
  type,
  creditCards = [],
  isDeleting,
}) => {
  const [formData, setFormData] = useState({ ...item, credit_card_id: item.credit_card?.id || '' });
  const [confirmActionOpen, setConfirmActionOpen] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    if (isEditing) {
      setFormData({ ...item, credit_card_id: item.credit_card?.id || '' });
    }
  }, [isEditing, item]);

  // Generic input change handler
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Strip decimals for display
  const stripDecimals = (value) => (parseFloat(value) === parseInt(value, 10) ? parseInt(value, 10) : value);

  const handleSave = () => onSave(formData);

  const handleConfirmAction = () => {
    if (actionType === 'delete') {
      onDelete(item.id);
    } else if (actionType === 'edit') {
      handleSave();
    }
    setConfirmActionOpen(false);
  };

  const openConfirmDialog = (type) => {
    setActionType(type);
    setConfirmActionOpen(true);
  };

  // Common rendering logic for inputs and display fields
  const renderField = (field, isInput, inputProps = {}, displayValue) => {
    if (isEditing && isInput) {
      return (
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          value={formData[field] || ''}
          name={field}
          onChange={handleInputChange}
          {...inputProps}
          style={{ height: '40px', backgroundColor: 'transparent' }}
        />
      );
    }
    return displayValue || 'N/A';
  };

  const currentCreditCard = creditCards.find((card) => card.id === formData.credit_card_id);

  return (
    <>
      <TableRow key={item.id} className={isEditing ? 'editing' : ''}>
        <TableCell style={{ padding: '0 16px', width: '12%' }}>
          {isEditing ? (
            <FormControl fullWidth>
              <Select
                name="category"
                value={formData.category || ''}
                onChange={handleInputChange}
                displayEmpty
                size="small"
                style={{ backgroundColor: 'transparent' }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            categories.find((category) => category.id === formData.category)?.name || 'N/A'
          )}
        </TableCell>

        <TableCell style={{ padding: '0 16px', width: '12%' }}>
          {renderField('date', true, { type: 'date', InputLabelProps: { shrink: true } }, dayjs(formData.date).format('YYYY-MM-DD'))}
        </TableCell>

        <TableCell style={{ padding: '0 16px', width: '10%' }}>
          {renderField('amount', true, { type: 'number' }, stripDecimals(formData.amount))}
        </TableCell>

        <TableCell style={{ padding: '0 16px', width: '14%' }}>
          {renderField('description', true, {}, formData.description || 'N/A')}
        </TableCell>

        <TableCell style={{ padding: '0 16px', width: '8%' }}>
          {isEditing ? (
            <Checkbox name="is_recurring" checked={formData.is_recurring || false} onChange={handleInputChange} />
          ) : (
            formData.is_recurring ? 'Yes' : 'No'
          )}
        </TableCell>

        {type === 'expense' && (
          <>
            <TableCell style={{ padding: '0 16px', width: '12%' }}>
              {isEditing ? (
                <Checkbox
                  name="pay_with_credit_card"
                  checked={formData.pay_with_credit_card || false}
                  onChange={handleInputChange}
                />
              ) : (
                formData.pay_with_credit_card ? 'Yes' : 'No'
              )}
            </TableCell>

            <TableCell style={{ padding: '0 16px', width: '12%' }}>
              {isEditing ? (
                <FormControl fullWidth>
                  <Select
                    name="credit_card_id"
                    value={formData.credit_card_id || ''}
                    onChange={handleInputChange}
                    displayEmpty
                    disabled={!formData.pay_with_credit_card}
                  >
                    {creditCards.map((card) => (
                      <MenuItem key={card.id} value={card.id}>
                        {`${card.brand} **** ${card.last_four_digits}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                creditCards.find((card) => card.id === formData.credit_card_id)
                  ? `${currentCreditCard.brand} **** ${currentCreditCard.last_four_digits}`
                  : 'N/A'
              )}
            </TableCell>

            <TableCell style={{ padding: '0 16px', width: '8%' }}>
              {renderField('installments', true, { type: 'number', disabled: !formData.pay_with_credit_card }, stripDecimals(formData.installments))}
            </TableCell>

            <TableCell style={{ padding: '0 16px', width: '10%' }}>
              {renderField('surcharge', true, { type: 'number', disabled: !formData.pay_with_credit_card }, stripDecimals(formData.surcharge))}
            </TableCell>
          </>
        )}

        <TableCell style={{ display: 'flex', justifyContent: 'flex-start', padding: '0 16px', width: '16%' }}>
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
              <IconButton onClick={() => openConfirmDialog('delete')} disabled={isDeleting}>
                <DeleteIcon />
              </IconButton>
              {formData.is_recurring && (
                <IconButton onClick={() => onUpdateRecurring(item.id)} style={{ marginLeft: '8px' }}>
                  <MonetizationOnIcon />
                </IconButton>
              )}
            </>
          )}
        </TableCell>
      </TableRow>

      <ConfirmAction
        open={confirmActionOpen}
        onClose={() => setConfirmActionOpen(false)}
        onConfirm={handleConfirmAction}
        title={actionType === 'delete' ? 'Confirm Deletion' : 'Confirm Edit'}
        message={actionType === 'delete' ? `Are you sure you want to delete this ${type}?` : `Are you sure you want to save changes to this ${type}?`}
      />
    </>
  );
};

export default EditableRow;