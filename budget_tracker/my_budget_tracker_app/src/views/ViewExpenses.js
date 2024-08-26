import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography } from '@mui/material';
import Header from '../components/Header';
import SidebarMenu from '../components/SidebarMenu';
import { useAuth } from '../hooks/useAuth';
import { useFetchFinancialData } from '../hooks/useFetchFinancialData';
import dayjs from 'dayjs';
import axiosInstance from '../api/axiosApi';
import DatePicker from '../components/DatePicker';
import Calendar from '../components/Calendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import '../styles/ViewExpenses.css';
import ExpenseTable from '../components/ExpenseTable';

const ViewExpenses = () => {
  const { logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const { data, refetch } = useFetchFinancialData(selectedDate.year(), selectedDate.month() + 1);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [isValidRange, setIsValidRange] = useState(true);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExpenses = useCallback((start, end) => {
    const fetchedExpenses = data.expenses.filter(expense =>
      dayjs(expense.date).isBetween(start, end, null, '[]')
    );
    setSelectedExpenses(fetchedExpenses);
  }, [data]);

  useEffect(() => {
    if (isValidRange && data.expenses.length > 0) {
      fetchExpenses(dateRange[0], dateRange[1]);
    }
  }, [dateRange, data, isValidRange, fetchExpenses]);

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

  useEffect(() => {
    fetchCategories();
    fetchCreditCards();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const expensesForSelectedDate = data.expenses.filter(expense => dayjs(expense.date).isSame(date, 'day'));
    setSelectedExpenses(expensesForSelectedDate);
  };

  const handleDateRangeChange = (newValue) => {
    if (dayjs(newValue[1]).diff(dayjs(newValue[0]), 'day') > 31) {
      setIsValidRange(false);
    } else {
      setIsValidRange(true);
      setDateRange(newValue);
      fetchExpenses(newValue[0], newValue[1]);
      setSelectedDate(newValue[0]);
    }
  };

  const handleMonthChange = (date) => {
    const newStartDate = date.startOf('month');
    const newEndDate = date.endOf('month');
    setDateRange([newStartDate, newEndDate]);
    setSelectedDate(newStartDate);
    fetchExpenses(newStartDate, newEndDate);
  };

  const handleSave = async (formData) => {
    try {
      const response = await axiosInstance.put(`/api/expenses/${editingExpenseId}/`, formData);
      if (response.status === 200) {
        refetch();
        setEditingExpenseId(null);
      } else {
        throw new Error('Failed to update expense');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDelete = async (expenseId) => {
    if (isDeleting) return;
  
    setIsDeleting(true);
  
    try {
      const response = await axiosInstance.delete(`/api/expenses/${expenseId}/`);
      if (response.status === 204) {
        refetch(); // Refetch data only on successful delete
        console.log('Expense deleted successfully');
      } else {
        throw new Error('Failed to delete expense');
      }
    } finally {
      setIsDeleting(false); // Reset deleting state
    }
  };

  const handleEdit = (expense) => {
    setEditingExpenseId(expense.id);
  };

  const handleCancel = () => {
    setEditingExpenseId(null);
  };

  return (
    <div className="view-expenses">
      <div className="sidebar-container">
        <SidebarMenu />
      </div>
      <div className="content">
        <Header logout={logout} />
        <Typography variant="h4" gutterBottom>View Expenses</Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker dateRange={dateRange} handleDateRangeChange={handleDateRangeChange} isValidRange={isValidRange} />
          {isValidRange && (
            <Calendar
              selectedDate={selectedDate}
              handleDateChange={handleDateChange}
              handleMonthChange={handleMonthChange}
              data={data}
            />
          )}
        </LocalizationProvider>
        <Container maxWidth="lg">
          <ExpenseTable
            expenses={selectedExpenses}
            editingExpenseId={editingExpenseId}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSave={handleSave}
            onDelete={handleDelete}  // Directly handle deletion here
            categories={categories}
            creditCards={creditCards}
            isDeleting={isDeleting} // Pass isDeleting state to disable the delete button
          />
        </Container>
      </div>
    </div>
  );
};

export default ViewExpenses;
