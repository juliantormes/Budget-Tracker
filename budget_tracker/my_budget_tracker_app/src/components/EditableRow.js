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
  type,  // expense or income
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

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

  const currentCreditCard = creditCards.find((card) => card.id === formData.credit_card_id);

  // Disable amount field if the item is recurring
  const isRecurring = formData.is_recurring;

  // Common styles for inputs
  const commonInputStyle = {
    height: '36px',
    padding: '0 8px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
  };

  return (
    <>
      <TableRow key={item.id} className={isEditing ? 'editing' : ''}>
        {/* Category Cell */}
        <TableCell style={{ padding: '4px 8px', width: '12%' }}>  {/* Reduce padding here */}
          {isEditing ? (
            <FormControl fullWidth sx={commonInputStyle}>
              <Select
                name="category"
                value={formData.category || ''}
                onChange={handleInputChange}
                displayEmpty
                size="small"
                sx={{ height: '36px' }}  // Match height with other inputs
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

        {/* Date Cell */}
        <TableCell style={{ padding: '4px 8px', width: '12%' }}>  {/* Reduce padding here */}
          {isEditing ? (
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              value={dayjs(formData.date).format('YYYY-MM-DD')}
              name="date"
              type="date"
              onChange={handleInputChange}
              sx={commonInputStyle}
            />
          ) : (
            dayjs(formData.date).format('YYYY-MM-DD')
          )}
        </TableCell>

        {/* Amount Cell */}
        <TableCell style={{ padding: '4px 8px', width: '10%' }}>  {/* Reduce padding here */}
          {isEditing ? (
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              value={formData.amount || ''}
              name="amount"
              onChange={handleInputChange}
              disabled={isRecurring}  // Disable amount if it's a recurring item
              type="number"
              sx={commonInputStyle}
            />
          ) : (
            formData.amount || 'N/A'
          )}
        </TableCell>

        {/* Description Cell */}
        <TableCell style={{ padding: '4px 8px', width: '14%' }}>  {/* Reduce padding here */}
          {isEditing ? (
            <TextField
              variant="outlined"
              size="small"
              fullWidth
              value={formData.description || ''}
              name="description"
              onChange={handleInputChange}
              sx={commonInputStyle}
            />
          ) : (
            formData.description || 'N/A'
          )}
        </TableCell>

        {/* Recurring Checkbox Cell */}
        <TableCell style={{ padding: '4px 8px', width: '8%' }}>  {/* Reduce padding here */}
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

        {/* Only for expenses: Paid with Credit Card */}
        {type === 'expense' && (
          <>
            <TableCell style={{ padding: '4px 8px', width: '12%' }}>  {/* Reduce padding here */}
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

            {/* Credit Card Field */}
            <TableCell style={{ padding: '4px 8px', width: '12%' }}>  {/* Reduce padding here */}
              {isEditing ? (
                <FormControl fullWidth sx={commonInputStyle}>
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
                </FormControl>
              ) : (
                currentCreditCard ? `${currentCreditCard.brand} **** ${currentCreditCard.last_four_digits}` : 'N/A'
              )}
            </TableCell>

            {/* Installments Cell */}
            <TableCell style={{ padding: '4px 8px', width: '8%' }}>  {/* Reduce padding here */}
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
                  sx={commonInputStyle}
                />
              ) : (
                formData.installments || 'N/A'
              )}
            </TableCell>

            {/* Surcharge Cell */}
            <TableCell style={{ padding: '4px 8px', width: '10%' }}>  {/* Reduce padding here */}
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
                  sx={commonInputStyle}
                />
              ) : (
                formData.surcharge || 'N/A'
              )}
            </TableCell>
          </>
        )}

        {/* Actions Cell */}
        <TableCell style={{ display: 'flex', justifyContent: 'flex-start', padding: '4px 8px', width: '16%' }}>  {/* Reduce padding here */}
          {isEditing ? (
            <>
              <IconButton onClick={() => openConfirmDialog('edit')} aria-label='Save'>
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
