import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import Header from '../components/Header';
import SidebarMenu from '../components/SidebarMenu';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosApi';
import '../styles/AddIncomes.css';

const AddIncomes = () => {
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    category: '',
    date: '',
    amount: '',
    description: '',
    is_recurring: false,
  });
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/api/income_categories/');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/incomes/', formData);
      if (response.status === 201) {
        setMessage('Income added successfully!');
        setFormData({ category: '', date: '', amount: '', description: '', is_recurring: false });
      } else {
        throw new Error('Failed to add income');
      }
    } catch (error) {
      console.error(error);
      setMessage('Error adding income');
    }
  };

  return (
    <div className="add-incomes">
      <div className="sidebar-container">
        <SidebarMenu />
      </div>
      <div className="content">
        <Header logout={logout} />
        <Container className="container-top">
          <Typography variant="h4" gutterBottom>Add Incomes</Typography>
          <form onSubmit={handleSubmit} className="form-container">
            <TextField
              select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              className="text-field"
            >
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              className="text-field"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              required
              fullWidth
              variant="outlined"
              className="text-field"
            />
            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              className="text-field"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.is_recurring}
                  onChange={handleChange}
                  name="is_recurring"
                  color="primary"
                />
              }
              label="Recurring Income"
            />
            <Button type="submit" variant="contained" color="primary" className="submit-button">
              Add Income
            </Button>
          </form>
          {message && <Typography variant="body2" color="textSecondary">{message}</Typography>}
        </Container>
      </div>
    </div>
  );
};

export default AddIncomes;
