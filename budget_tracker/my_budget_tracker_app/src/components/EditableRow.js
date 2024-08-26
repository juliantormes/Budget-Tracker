import React, { useState, useEffect } from 'react';
import { TableCell, TableRow, TextField, IconButton, MenuItem, Select, FormControl, Checkbox } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';
import ConfirmAction from './ConfirmAction';

const EditableRow = ({ 
  item = {}, 
  isEditing, 
  onEdit, 
  onCancel, 
  onSave, 
  onDelete, 
  categories = [], 
  type, 
  creditCards = [], 
  isDeleting 
}) => {
  const [formData, setFormData] = useState({ ...item, credit_card_id: item.credit_card?.id || '' });
  const [confirmActionOpen, setConfirmActionOpen] = useState(false);
  const [actionType, setActionType] = useState('');

  useEffect(() => {
    if (isEditing) {
      setFormData({ ...item, credit_card_id: item.credit_card?.id || '' });
    }
  }, [isEditing, item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (event) => {
    setFormData({ ...formData, category: event.target.value });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handlePayWithCreditCardChange = (e) => {
    const isChecked = e.target.checked;
    if (!isChecked) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        pay_with_credit_card: false,
        credit_card_id: '',
        installments: 1,
        surcharge: 0.00,
      }));
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        pay_with_credit_card: true,
      }));
    }
  };

  const handleSave = async () => {
    onSave(formData); // Trigger save using the onSave prop
  };

  const handleActionConfirm = () => {
    if (actionType === 'delete') {
      onDelete(item.id); // Trigger deletion using the onDelete prop
    } else if (actionType === 'edit') {
      handleSave(); // Trigger save
    }
    setConfirmActionOpen(false); // Close the confirmation dialog
  };

  const openConfirmDialog = (type) => {
    setActionType(type);
    setConfirmActionOpen(true);
  };

  const currentCategory = categories.find((category) => category.id === formData.category)?.name || 'N/A';
  const currentCreditCard = creditCards.find((card) => card.id === formData.credit_card_id);

  return (
    <>
      <TableRow key={item.id} className={isEditing ? 'editing' : ''}>
        <TableCell className="table-cell">
          {isEditing ? (
            <FormControl fullWidth>
              <Select
                name="category"
                value={formData.category || ''}
                onChange={handleCategoryChange}
                displayEmpty
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                }}
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
        <TableCell className="table-cell">
          {isEditing ? (
            <TextField
              name="date"
              type="date"
              value={formData.date ? dayjs(formData.date).format('YYYY-MM-DD') : ''}
              onChange={handleChange}
              fullWidth
              className="text-field"
              InputProps={{
                style: {
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  padding: 0,
                },
              }}
            />
          ) : (
            formData.date ? dayjs(formData.date).format('YYYY-MM-DD') : 'N/A'
          )}
        </TableCell>
        <TableCell className="table-cell">
          {isEditing ? (
            <TextField
              name="amount"
              type="number"
              value={formData.amount || ''}
              onChange={handleChange}
              fullWidth
              className="text-field"
              InputProps={{
                style: {
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  padding: 0,
                },
              }}
            />
          ) : (
            formData.amount !== undefined ? formData.amount : 'N/A'
          )}
        </TableCell>
        <TableCell className="table-cell">
          {isEditing ? (
            <TextField
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              fullWidth
              className="text-field"
              InputProps={{
                style: {
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  padding: 0,
                },
              }}
            />
          ) : (
            formData.description || 'N/A'
          )}
        </TableCell>
        {type === 'expense' && (
          <>
            <TableCell className="table-cell">
              {isEditing ? (
                <Checkbox
                  name="is_recurring"
                  checked={formData.is_recurring || false}
                  onChange={handleCheckboxChange}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    boxShadow: 'none',
                    padding: 0,
                  }}
                />
              ) : (
                formData.is_recurring ? 'Yes' : 'No'
              )}
            </TableCell>
            <TableCell className="table-cell">
              {isEditing ? (
                <Checkbox
                  name="pay_with_credit_card"
                  checked={formData.pay_with_credit_card || false}
                  onChange={handlePayWithCreditCardChange}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    boxShadow: 'none',
                    padding: 0,
                  }}
                />
              ) : (
                formData.pay_with_credit_card ? 'Yes' : 'No'
              )}
            </TableCell>
            <TableCell className="table-cell">
              {isEditing ? (
                <FormControl fullWidth>
                  <Select
                    name="credit_card_id"
                    value={formData.credit_card_id || ''}
                    onChange={handleChange}
                    displayEmpty
                    disabled={!formData.pay_with_credit_card}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      boxShadow: 'none',
                      width: '150px' // Set a fixed width for the dropdown
                    }}
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
            <TableCell className="table-cell">
              {isEditing ? (
                <TextField
                  name="installments"
                  type="number"
                  value={formData.installments || ''}
                  onChange={handleChange}
                  fullWidth
                  className="text-field"
                  InputProps={{
                    style: {
                      backgroundColor: 'transparent',
                      border: 'none',
                      boxShadow: 'none',
                      padding: 0,
                    },
                  }}
                  disabled={!formData.pay_with_credit_card}
                />
              ) : (
                formData.installments !== undefined ? formData.installments : 'N/A'
              )}
            </TableCell>
            <TableCell className="table-cell">
              {isEditing ? (
                <TextField
                  name="surcharge"
                  type="number"
                  value={formData.surcharge || ''}
                  onChange={handleChange}
                  fullWidth
                  className="text-field"
                  InputProps={{
                    style: {
                      backgroundColor: 'transparent',
                      border: 'none',
                      boxShadow: 'none',
                      padding: 0,
                    },
                  }}
                  disabled={!formData.pay_with_credit_card}
                />
              ) : (
                formData.surcharge !== undefined ? formData.surcharge : 'N/A'
              )}
            </TableCell>
          </>
        )}
        {type === 'income' && (
          <TableCell className="table-cell">
            {isEditing ? (
              <Checkbox
                name="is_recurring"
                checked={formData.is_recurring || false}
                onChange={handleCheckboxChange}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  padding: 0,
                }}
              />
            ) : (
              formData.is_recurring ? 'Yes' : 'No'
            )}
          </TableCell>
        )}
        <TableCell className="table-cell" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
