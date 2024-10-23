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
  const [severity, setSeverity] = useState(''); // To handle success or error messages
  const [errors, setErrors] = useState({}); // Field-specific errors

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
    setMessage(''); // Clear previous messages

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
        const errorData = error.response.data;
        const fieldErrors = {};

        // Handle field-specific errors
        if (typeof errorData === 'object') {
          Object.entries(errorData).forEach(([field, messages]) => {
            fieldErrors[field] = messages.join(', ');
          });
        }

        setErrors(fieldErrors); // Assign errors to the form fields
        setMessage('Error adding income. Please check the fields.');
        setSeverity('error');
      } else {
        console.error('Error:', error);
        setMessage('An unexpected error occurred. Please try again.');
        setSeverity('error');
      }
    }
  };

  return (
    <Layout logout={logout}>
      <Container className="container-top">
        <Typography variant="h4" gutterBottom>Add Income</Typography>
        {message && <AlertMessage message={message} severity={severity} />}
        <IncomeForm
          formData={formData}
          categories={categories}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          errors={errors} // Pass field-specific errors down to the form
        />
        {/* Add the data-testid to the button to simplify the tests */}
        <button
          data-testid="submit-income"
          type="submit"
          className="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary"
          onClick={handleSubmit}
        >
          Add Income
        </button>
      </Container>
    </Layout>
  );
};

export default AddIncomes;
