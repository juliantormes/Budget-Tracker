import React, { useState } from 'react';
import { Container, TextField, Button, Typography } from '@mui/material';
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/credit_cards/', formData);
      if (response.status === 201) {
        // Handle successful submission (e.g., redirect or show a message)
        console.log('Credit card added successfully');
      }
    } catch (error) {
      console.error('Error adding credit card:', error);
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
