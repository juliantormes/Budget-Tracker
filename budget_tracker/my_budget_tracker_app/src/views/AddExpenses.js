import React, { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosApi';
import ExpenseForm from '../components/ExpenseForm';
import AlertMessage from '../components/AlertMessage';
import Layout from '../components/Layout';
import '../styles/FormStyles.css';

const AddExpenses = () => {
  const { logout } = useAuth();
  const [formData, setFormData] = useState({
    category: '',
    date: '',
    amount: '',
    description: '',
    is_recurring: false,
    pay_with_credit_card: false,
    credit_card_id: '',
    installments: 1,
    surcharge: 0,
  });

  const [categories, setCategories] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState('');

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
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');

    // Frontend validation for recurring expenses with more than 1 installment
    if (formData.is_recurring && formData.installments > 1) {
      setMessage('Recurring expenses cannot have more than 1 installment.');
      setSeverity('error');
      return;
    }

    const submissionData = {
      ...formData,
      installments: formData.pay_with_credit_card ? formData.installments : 1,
      surcharge: formData.pay_with_credit_card ? formData.surcharge : 0,
    };

    try {
      const response = await axiosInstance.post('/api/expenses/', submissionData);
      if (response.status === 201) {
        setMessage('Expense added successfully!');
        setSeverity('success');
        setFormData({
          category: '',
          date: '',
          amount: '',
          description: '',
          is_recurring: false,
          pay_with_credit_card: false,
          credit_card_id: '',
          installments: 1,
          surcharge: 0,
        });
      } else {
        throw new Error('Failed to add expense');
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const fieldErrors = {};

        // Parse and display specific field errors
        if (typeof errorData === 'object') {
          Object.entries(errorData).forEach(([field, messages]) => {
            fieldErrors[field] = messages.join(', ');
          });
        }

        setErrors(fieldErrors);
        setMessage('Error adding expense. Please check the fields.');
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
        {/* Custom Alert */}
        {message && <AlertMessage message={message} severity={severity} className="custom-alert" />}

        <Container className="container-top">
          {/* Title "Add Expenses" */}
          <Typography variant="h4" gutterBottom>Add Expenses</Typography>

          {/* The rest of the form */}
          <ExpenseForm
            formData={formData}
            categories={categories}
            creditCards={creditCards}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            errors={errors}
          />
        </Container>
      </div>
    </Layout>
  );
};

export default AddExpenses;
