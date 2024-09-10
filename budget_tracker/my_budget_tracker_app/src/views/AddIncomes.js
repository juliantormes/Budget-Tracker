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
  const [severity, setSeverity] = useState(''); // To handle severity (success or error)
  const [errors, setErrors] = useState({}); // To handle field-specific errors

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
    setErrors({}); // Clear previous errors
    try {
      const response = await axiosInstance.post('/api/incomes/', formData);
      if (response.status === 201) {
        setMessage('Income added successfully!');
        setSeverity('success');
        setFormData({ category: '', date: '', amount: '', description: '', is_recurring: false });
      } else {
        throw new Error('Failed to add income');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        // Capture field-specific errors
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          setErrors(errorData); // Set errors for specific fields
        } else {
          setMessage('Error adding income'); // General error
        }
        setSeverity('error');
      } else {
        console.error(error);
        setMessage('Error adding income');
        setSeverity('error');
      }
    }
  };

  return (
    <Layout logout={logout}>
      <Container className="container-top">
        <Typography variant="h4" gutterBottom>Add Incomes</Typography>
        <AlertMessage message={message} severity={severity} />
        <IncomeForm
          formData={formData}
          categories={categories}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          errors={errors} // Pass down errors to form
        />
      </Container>
    </Layout>
  );
};

export default AddIncomes;
