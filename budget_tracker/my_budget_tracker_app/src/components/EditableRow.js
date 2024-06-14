import React, { useState, useEffect } from 'react';
import { TableCell, TableRow, TextField, IconButton, MenuItem, Select, FormControl, Checkbox } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';
import ConfirmAction from './ConfirmAction';
import axiosInstance from '../api/axiosApi';

const EditableRow = ({ item = {}, isEditing, onEdit, onCancel, onSave, onDelete, categories, type }) => {
  const [formData, setFormData] = useState({ ...item });
  const [confirmActionOpen, setConfirmActionOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [payWithCreditCard, setPayWithCreditCard] = useState(item.pay_with_credit_card || false);
  const [creditCards, setCreditCards] = useState([]);

  useEffect(() => {
    if (isEditing) {
      setFormData({ ...item });
      setPayWithCreditCard(item.pay_with_credit_card || false);
      fetchCreditCards();
    }
  }, [isEditing, item]);

  const fetchCreditCards = async () => {
    try {
      const response = await axiosInstance.get('/api/credit_cards/');
      console.log('Credit cards fetched:', response.data); // Debugging log
      setCreditCards(response.data);
    } catch (error) {
      console.error('Error fetching credit cards:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCategoryChange = (event) => {
    setFormData({ ...formData, category: event.target.value });
  };

  const handleCheckboxChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const handlePayWithCreditCardChange = (e) => {
    const isChecked = e.target.checked;
    setPayWithCreditCard(isChecked);
    setFormData({ ...formData, pay_with_credit_card: isChecked });
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
  const currentCreditCard = creditCards.find((card) => card.id === formData.credit_card)?.last_four_digits || 'N/A';

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
                />
              ) : (
                formData.is_recurring ? 'Yes' : 'No'
              )}
            </TableCell>
            <TableCell className="table-cell">
              {isEditing ? (
                <Checkbox
                  name="pay_with_credit_card"
                  checked={payWithCreditCard}
                  onChange={handlePayWithCreditCardChange}
                />
              ) : (
                formData.pay_with_credit_card ? 'Yes' : 'No'
              )}
            </TableCell>
            {isEditing && payWithCreditCard && (
              <>
                <TableCell className="table-cell">
                  <FormControl fullWidth>
                    <Select
                      name="credit_card"
                      value={formData.credit_card || ''}
                      onChange={handleChange}
                      displayEmpty
                    >
                      {creditCards.map((card) => (
                        <MenuItem key={card.id} value={card.id}>
                          {`${card.brand} **** ${card.last_four_digits}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell className="table-cell">
                  <TextField
                    name="installments"
                    type="number"
                    value={formData.installments || ''}
                    onChange={handleChange}
                    fullWidth
                    className="text-field"
                  />
                </TableCell>
                <TableCell className="table-cell">
                  <TextField
                    name="surcharge"
                    type="number"
                    value={formData.surcharge || ''}
                    onChange={handleChange}
                    fullWidth
                    className="text-field"
                  />
                </TableCell>
              </>
            )}
            {!isEditing && (
              <>
                <TableCell className="table-cell">
                  {currentCreditCard}
                </TableCell>
                <TableCell className="table-cell">
                  {formData.installments !== undefined ? formData.installments : 'N/A'}
                </TableCell>
                <TableCell className="table-cell">
                  {formData.surcharge !== undefined ? formData.surcharge : 'N/A'}
                </TableCell>
              </>
            )}
          </>
        )}
        {type === 'income' && (
          <TableCell className="table-cell">
            {isEditing ? (
              <Checkbox
                name="is_recurring"
                checked={formData.is_recurring || false}
                onChange={handleCheckboxChange}
              />
            ) : (
              formData.is_recurring ? 'Yes' : 'No'
            )}
          </TableCell>
        )}
        <TableCell className="table-cell">
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
