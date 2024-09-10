import React, { useState } from 'react';
import { Container, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosApi';
import CreditCardForm from '../components/CreditCardForm';
import AlertMessage from '../components/AlertMessage';
import Layout from '../components/Layout';
import '../styles/FormStyles.css';

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
        // Extract the detailed errors and set them
        const errorData = error.response.data;
        let formattedErrors = {};

        if (typeof errorData === 'object') {
          formattedErrors = Object.entries(errorData).reduce((acc, [field, messages]) => {
            acc[field] = messages.join(', ');
            return acc;
          }, {});
        } else {
          formattedErrors.general = 'An error occurred while adding the credit card.';
        }

        setErrors(formattedErrors);
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again.' });
      }
    }
  };

  return (
    <Layout logout={logout}>
      <Container maxWidth="sm" className="container-top">
        <Typography variant="h4" gutterBottom>Add Credit Card</Typography>
        {successMessage && <AlertMessage message={successMessage} severity="success" />}
        {errors.general && <AlertMessage message={errors.general} severity="error" />}
        <CreditCardForm
          formData={formData}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          errors={errors}
        />
      </Container>
    </Layout>
  );
};

export default AddCreditCard;
