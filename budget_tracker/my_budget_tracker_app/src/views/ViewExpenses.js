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
import DeleteDialog from '../components/DeleteDialog';

const ViewExpenses = () => {
  const { logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const { data, loading, error, refetch } = useFetchFinancialData(selectedDate.year(), selectedDate.month() + 1);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [isValidRange, setIsValidRange] = useState(true);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // New state to prevent multiple deletions

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
      console.log('Fetched categories:', response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchCreditCards = async () => {
    try {
      const response = await axiosInstance.get('/api/credit_cards/');
      setCreditCards(response.data);
      console.log('Fetched credit cards:', response.data);
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

  const handleDeleteClick = useCallback((expenseId) => {
    if (!isDeleting && !openDeleteDialog) {  // Prevent opening dialog if already deleting
      console.log('Delete clicked for expense ID:', expenseId);
      setExpenseToDelete(expenseId);
      setOpenDeleteDialog(true);
    }
  }, [isDeleting, openDeleteDialog]);

  const handleConfirmDelete = async () => {
    if (!expenseToDelete || isDeleting) return;
  
    setIsDeleting(true); // Set isDeleting true to prevent further clicks
  
    try {
      console.log('Delete confirmed for expense ID:', expenseToDelete);
      const response = await axiosInstance.delete(`/api/expenses/${expenseToDelete}/`);
      if (response.status === 204) {
        console.log('Expense deleted:', expenseToDelete);
        setOpenDeleteDialog(false);  // Close the dialog
        setExpenseToDelete(null);    // Reset the expense to delete
        refetch();                   // Refetch data only on successful delete
      } else {
        throw new Error('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      setOpenDeleteDialog(false);  // Ensure the dialog is closed on error
    } finally {
      setIsDeleting(false);  // Reset deleting state after operation
    }
  };
  
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setExpenseToDelete(null);
    setIsDeleting(false);  // Reset deleting state to prevent re-triggering delete
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
            onDelete={handleDeleteClick}  // Updated to ensure correct delete handling
            categories={categories}
            creditCards={creditCards}
          />
        </Container>
        <DeleteDialog
          open={openDeleteDialog}
          handleClose={handleCloseDeleteDialog}
          handleConfirm={handleConfirmDelete}
        />
      </div>
    </div>
  );
};

export default ViewExpenses;
