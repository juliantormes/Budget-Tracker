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
        setErrors(error.response.data);
      } else {
        console.error('Error message:', error.message);
      }
    }
  };

  return (
    <Layout logout={logout}>
      <Container maxWidth="sm" className="container-top">
        <Typography variant="h4" gutterBottom>Add Credit Card</Typography>
        <AlertMessage message={successMessage} severity="success" />
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
