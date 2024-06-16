import React, { useState } from 'react';
import { Container, TextField, Button, Typography, Alert } from '@mui/material';
import Header from '../components/Header';
import SidebarMenu from '../components/SidebarMenu';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosApi';
import '../styles/FormStyles.css'; // Import the consolidated form styles

const AddCreditCard = () => {
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    last_four_digits: '',
    brand: '',
    expire_date: '',
    credit_limit: '',
    payment_day: '',
    close_card_day: '',
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors
    setSuccessMessage(''); // Clear previous success message

    try {
      const response = await axiosInstance.post('/api/credit_cards/', formData);
      if (response.status === 201) {
        // Handle successful submission (e.g., redirect or show a message)
        setSuccessMessage('Credit card added successfully');
        setFormData({
          last_four_digits: '',
          brand: '',
          expire_date: '',
          credit_limit: '',
          payment_day: '',
          close_card_day: '',
        });
      }
    } catch (error) {
      if (error.response) {
        // Handle validation errors from the backend
        setErrors(error.response.data);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  return (
    <div className="add-credit-card">
      <div className="sidebar-container">
        <SidebarMenu />
      </div>
      <div className="content">
        <Header logout={logout} />
        <Container maxWidth="sm" className="container-top">
          <Typography variant="h4" gutterBottom>Add Credit Card</Typography>
          {successMessage && <Alert severity="success">{successMessage}</Alert>}
          <form onSubmit={handleSubmit} className="form-container">
            <TextField
              label="Last Four Digits"
              name="last_four_digits"
              value={formData.last_four_digits}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              className="text-field"
              error={Boolean(errors.last_four_digits)}
              helperText={errors.last_four_digits}
            />
            <TextField
              label="Brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              className="text-field"
              error={Boolean(errors.brand)}
              helperText={errors.brand}
            />
            <TextField
              label="Expire Date"
              name="expire_date"
              type="date"
              value={formData.expire_date}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              className="text-field"
              InputLabelProps={{
                shrink: true,
              }}
              error={Boolean(errors.expire_date)}
              helperText={errors.expire_date}
            />
            <TextField
              label="Credit Limit"
              name="credit_limit"
              type="number"
              value={formData.credit_limit}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              className="text-field"
              error={Boolean(errors.credit_limit)}
              helperText={errors.credit_limit}
            />
            <TextField
              label="Payment Day"
              name="payment_day"
              type="number"
              value={formData.payment_day}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              className="text-field"
              error={Boolean(errors.payment_day)}
              helperText={errors.payment_day}
            />
            <TextField
              label="Close Card Day"
              name="close_card_day"
              type="number"
              value={formData.close_card_day}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              className="text-field"
              error={Boolean(errors.close_card_day)}
              helperText={errors.close_card_day}
            />
            <Button type="submit" variant="contained" color="primary" className="submit-button">
              Add Credit Card
            </Button>
          </form>
        </Container>
      </div>
    </div>
  );
};

export default AddCreditCard;
