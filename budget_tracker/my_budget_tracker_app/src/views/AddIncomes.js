import React, { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosApi';
import IncomeForm from '../components/IncomeForm';
import AlertMessage from '../components/AlertMessage';
import Layout from '../components/Layout';
import '../styles/FormStyles.css';

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
    <Layout logout={logout}>
      <Container className="container-top">
        <Typography variant="h4" gutterBottom>Add Incomes</Typography>
        <AlertMessage message={message} severity={message === 'Income added successfully!' ? 'success' : 'error'} />
        <IncomeForm
          formData={formData}
          categories={categories}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
        />
      </Container>
    </Layout>
  );
};

export default AddIncomes;
