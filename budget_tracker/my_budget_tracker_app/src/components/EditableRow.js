import React, { useState, useEffect } from 'react';
import {
  TableCell, TableRow, TextField, IconButton, MenuItem, Select, FormControl, Checkbox,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import dayjs from 'dayjs';
import ConfirmAction from './ConfirmAction';
import AlertMessage from './AlertMessage';

const EditableRow = ({
  item = {},
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onUpdateRecurring,
  categories = [],
  type, // expense or income
  creditCards = [],
  isDeleting,
}) => {
  const [formData, setFormData] = useState({ ...item, credit_card_id: item.credit_card?.id || '', effective_amount: item.effective_amount || item.amount });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [confirmActionOpen, setConfirmActionOpen] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    if (isEditing) {
      setFormData({ ...item, credit_card_id: item.credit_card?.id || '' });
    }
  }, [isEditing, item]);

  const validateForm = () => {
    let newErrors = {};

    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Amount must be greater than 0';

    if (formData.pay_with_credit_card) {
      if (!formData.credit_card_id) newErrors.credit_card_id = 'Credit card selection is required';
      if (!formData.installments || formData.installments <= 0) newErrors.installments = 'Installments must be greater than 0';
      if (!formData.surcharge || formData.surcharge < 0) newErrors.surcharge = 'Surcharge cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: '' })); // Clear error for the field on change
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
    } else {
      setGeneralError('Please correct the highlighted errors before saving.');
    }
  };

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

  const currentCreditCard = creditCards.find((card) => card.id === formData.credit_card_id);

  const isRecurring = formData.is_recurring;

  const commonInputStyle = {
    height: '36px',
    padding: '0 8px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <>
      {generalError && <AlertMessage message={generalError} severity="error" />}

      <TableRow key={item.id} className={isEditing ? 'editing' : ''} data-testid={`${type}-row-${item.id}`}>
        <TableCell style={{ padding: '4px 8px', width: '12%' }}>
          {isEditing ? (
            <FormControl fullWidth sx={commonInputStyle} error={!!errors.category}>
              <Select
                name="category"
                value={formData.category || ''}
                onChange={handleInputChange}
                displayEmpty
                size="small"
                sx={{ height: '36px' }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && <span className="error-text">{errors.category}</span>}
            </FormControl>
          ) : (
            categories.find((category) => category.id === formData.category)?.name || 'N/A'
          )}
        </TableCell>

        <TableCell style={{ padding: '4px 8px', width: '12%' }}>
          {isEditing ? (
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              value={dayjs(formData.date).format('YYYY-MM-DD')}
              name="date"
              type="date"
              onChange={handleInputChange}
              error={!!errors.date}
              helperText={errors.date}
              sx={commonInputStyle}
            />
          ) : (
            dayjs(formData.date).format('YYYY-MM-DD')
          )}
        </TableCell>

        <TableCell style={{ padding: '4px 8px', width: '10%' }}>
          {isEditing ? (
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              value={formData.amount || ''}
              name="amount"
              onChange={handleInputChange}
              disabled={isRecurring}
              type="number"
              error={!!errors.amount}
              helperText={errors.amount}
              sx={commonInputStyle}
            />
          ) : (
            formData.amount || 'N/A'
          )}
        </TableCell>

        <TableCell style={{ padding: '4px 8px', width: '14%' }}>
          {isEditing ? (
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              value={formData.description || ''}
              name="description"
              onChange={handleInputChange}
              error={!!errors.description}
              helperText={errors.description}
              aria-label="description"
              sx={commonInputStyle}
            />
          ) : (
            formData.description || 'N/A'
          )}
        </TableCell>

        <TableCell style={{ padding: '4px 8px', width: '8%' }}>
          {isEditing ? (
            <Checkbox
              name="is_recurring"
              checked={formData.is_recurring || false}
              onChange={handleInputChange}
              sx={{ padding: '0', height: '36px', display: 'flex', alignItems: 'center' }}
            />
          ) : (
            formData.is_recurring ? 'Yes' : 'No'
          )}
        </TableCell>

        {type === 'expense' && (
          <>
            <TableCell style={{ padding: '4px 8px', width: '12%' }}>
              {isEditing ? (
                <Checkbox
                  name="pay_with_credit_card"
                  checked={formData.pay_with_credit_card || false}
                  onChange={handleInputChange}
                  sx={{ padding: '0', height: '36px', display: 'flex', alignItems: 'center' }}
                />
              ) : (
                formData.pay_with_credit_card ? 'Yes' : 'No'
              )}
            </TableCell>

            <TableCell style={{ padding: '4px 8px', width: '12%' }}>
              {isEditing ? (
                <FormControl fullWidth sx={commonInputStyle} error={!!errors.credit_card_id}>
                  <Select
                    name="credit_card_id"
                    value={formData.credit_card_id || ''}
                    onChange={handleInputChange}
                    displayEmpty
                    size="small"
                    sx={{ height: '36px' }}
                    disabled={!formData.pay_with_credit_card}
                  >
                    {creditCards.map((card) => (
                      <MenuItem key={card.id} value={card.id}>
                        {`${card.brand} **** ${card.last_four_digits}`}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.credit_card_id && <span className="error-text">{errors.credit_card_id}</span>}
                </FormControl>
              ) : (
                currentCreditCard ? `${currentCreditCard.brand} **** ${currentCreditCard.last_four_digits}` : 'N/A'
              )}
            </TableCell>

            <TableCell style={{ padding: '4px 8px', width: '8%' }}>
              {isEditing ? (
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={formData.installments || ''}
                  name="installments"
                  onChange={handleInputChange}
                  disabled={!formData.pay_with_credit_card}
                  type="number"
                  error={!!errors.installments}
                  helperText={errors.installments}
                  sx={commonInputStyle}
                />
              ) : (
                formData.installments || 'N/A'
              )}
            </TableCell>

            <TableCell style={{ padding: '4px 8px', width: '10%' }}>
              {isEditing ? (
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={formData.surcharge || ''}
                  name="surcharge"
                  onChange={handleInputChange}
                  disabled={!formData.pay_with_credit_card}
                  type="number"
                  error={!!errors.surcharge}
                  helperText={errors.surcharge}
                  sx={commonInputStyle}
                />
              ) : (
                formData.surcharge !== undefined && formData.surcharge !== null && !isNaN(formData.surcharge)
                  ? Number(formData.surcharge).toFixed(2)
                  : 'N/A'
              )}
            </TableCell>
          </>
        )}

        <TableCell style={{ display: 'flex', justifyContent: 'flex-start', padding: '4px 8px', width: '16%' }}>
          {isEditing ? (
            <>
              <IconButton onClick={() => openConfirmDialog('edit')} aria-label="Save changes">
                <SaveIcon />
              </IconButton>
              <IconButton onClick={onCancel} aria-label="Cancel changes">
                <CancelIcon />
              </IconButton>
            </>
          ) : (
            <>
              <IconButton onClick={() => onEdit(item)} aria-label="Edit item">
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => openConfirmDialog('delete')} disabled={isDeleting} aria-label="Delete item">
                <DeleteIcon />
              </IconButton>
              {formData.is_recurring && (
                <IconButton onClick={() => onUpdateRecurring(item.id)} style={{ marginLeft: '8px' }} aria-label="Update recurring">
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
