import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';
import dayjs from 'dayjs';
import '../styles/Dialogs.css';

const EditIncomeDialog = ({ open, onClose, income, onSave }) => {
  const [formData, setFormData] = useState({ ...income });

  useEffect(() => {
    setFormData({ ...income });
  }, [income]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} className="edit-dialog">
      <DialogTitle>Edit Income</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label="Category"
          name="category_name"
          value={formData.category_name}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label="Date"
          type="date"
          name="date"
          value={dayjs(formData.date).format('YYYY-MM-DD')}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          margin="dense"
          label="Amount"
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave} color="primary">Save</Button>
        <Button onClick={onClose} color="secondary">Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditIncomeDialog;
