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
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      installments: formData.pay_with_credit_card ? formData.installments : 1,
      surcharge: formData.pay_with_credit_card ? formData.surcharge : 0,
    };
    console.log('Form Data:', submissionData); // Log the form data being sent
    try {
      const response = await axiosInstance.post('/api/expenses/', submissionData);
      if (response.status === 201) {
        setMessage('Expense added successfully!');
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
      console.error('Error:', error.response ? error.response.data : error.message);
      setMessage('Error adding expense');
    }
  };

  return (
    <Layout logout={logout}>
      <Container className="container-top">
        <Typography variant="h4" gutterBottom>Add Expenses</Typography>
        <AlertMessage message={message} severity={message === 'Expense added successfully!' ? 'success' : 'error'} />
        <ExpenseForm
          formData={formData}
          categories={categories}
          creditCards={creditCards}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
        />
      </Container>
    </Layout>
  );
};

export default AddExpenses;
