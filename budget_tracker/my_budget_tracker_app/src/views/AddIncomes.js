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
  const [severity, setSeverity] = useState('');
  const [errors, setErrors] = useState({});

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
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');

    try {
      const response = await axiosInstance.post('/api/incomes/', formData);
      if (response.status === 201) {
        setMessage('Income added successfully!');
        setSeverity('success');
        setFormData({
          category: '',
          date: '',
          amount: '',
          description: '',
          is_recurring: false,
        });
      } else {
        throw new Error('Failed to add income');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const fieldErrors = {};

        if (typeof errorData === 'object') {
          Object.entries(errorData).forEach(([field, messages]) => {
            fieldErrors[field] = messages.join(', ');
          });
        }

        setErrors(fieldErrors);
        setMessage('Error adding income. Please check the fields.');
        setSeverity('error');
      } else {
        setMessage('An unexpected error occurred. Please try again.');
        setSeverity('error');
      }
    }
  };

  return (
    <Layout logout={logout}>
      <div className="form-container">
        {message && <AlertMessage message={message} severity={severity} className="custom-alert" />}
        <Container className="container-top">
          <Typography variant="h4" gutterBottom>Add Incomes</Typography>
          <IncomeForm
            formData={formData}
            categories={categories}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            errors={errors}
          />
        </Container>
      </div>
    </Layout>
  );
};

export default AddIncomes;
