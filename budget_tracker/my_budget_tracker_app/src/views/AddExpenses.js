import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Button, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import Header from '../components/Header';
import SidebarMenu from '../components/SidebarMenu';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosApi';
import '../styles/FormStyles.css'; // Import the consolidated form styles

const AddExpenses = () => {
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    category: '',
    date: '',
    amount: '',
    description: '',
    is_recurring: false,
    paid_with_credit_card: false,
    credit_card: '',
    installments: '',
    surcharge: '',
  });
  const [categories, setCategories] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/api/expense_categories/');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    const fetchCreditCards = async () => {
      try {
        const response = await axiosInstance.get('/api/credit_cards/');
        setCreditCards(response.data);
      } catch (error) {
        console.error('Error fetching credit cards:', error);
      }
    };

    fetchCategories();
    fetchCreditCards();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/expenses/', formData);
      if (response.status === 201) {
        setMessage('Expense added successfully!');
        setFormData({
          category: '',
          date: '',
          amount: '',
          description: '',
          is_recurring: false,
          paid_with_credit_card: false,
          credit_card: '',
          installments: '',
          surcharge: '',
        });
      } else {
        throw new Error('Failed to add expense');
      }
    } catch (error) {
      console.error(error);
      setMessage('Error adding expense');
    }
  };

  return (
    <div className="add-expenses">
      <div className="sidebar-container">
        <SidebarMenu />
      </div>
      <div className="content">
        <Header logout={logout} />
        <Container className="container-top">
          <Typography variant="h4" gutterBottom>Add Expenses</Typography>
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
              label="Recurring Expense"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.paid_with_credit_card}
                  onChange={handleChange}
                  name="paid_with_credit_card"
                  color="primary"
                />
              }
              label="Paid with Credit Card"
            />
            {formData.paid_with_credit_card && (
              <>
                <TextField
                  select
                  label="Credit Card"
                  name="credit_card"
                  value={formData.credit_card}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                  className="text-field"
                >
                  {creditCards.map((card) => (
                    <MenuItem key={card.id} value={card.id}>
                      {card.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Installments"
                  name="installments"
                  type="number"
                  value={formData.installments}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                  className="text-field"
                />
                <TextField
                  label="Surcharge (%)"
                  name="surcharge"
                  type="number"
                  value={formData.surcharge}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                  className="text-field"
                />
              </>
            )}
            <Button type="submit" variant="contained" color="primary" className="submit-button">
              Add Expense
            </Button>
          </form>
          {message && <Typography variant="body2" color="textSecondary">{message}</Typography>}
        </Container>
      </div>
    </div>
  );
};

export default AddExpenses;
