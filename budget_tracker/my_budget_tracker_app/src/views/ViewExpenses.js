import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Alert } from '@mui/material';
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

  const [openDialog, setOpenDialog] = useState(false);
  const [currentExpense, setCurrentExpense] = useState(null);
  const [newAmount, setNewAmount] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(dayjs());
  const [errorMessage, setErrorMessage] = useState(''); // For error notifications

  useEffect(() => {
    if (currentExpense) {
      setNewAmount(currentExpense.effective_amount || currentExpense.amount);  // Set the default value to the current amount
    }
  }, [currentExpense]);

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

  const handleSave = async () => {
    if (!currentExpense || !currentExpense.id) {
      setErrorMessage('Error: Cannot update expense because the necessary data is missing.');
      return;
    }
  
    const formData = {
      new_amount: parseFloat(newAmount),
      effective_date: effectiveDate.format('YYYY-MM-DD'),
    };
  
    try {
      // Check if there's already a change log for this month
      const existingLog = currentExpense.change_logs.find(log =>
        dayjs(log.effective_date).isSame(effectiveDate, 'month')
      );
  
      let response;
      if (existingLog) {
        // If a log exists for the current month, update it
        response = await axiosInstance.put(`/api/expenses/${currentExpense.id}/update_recurring/`, formData);
      } else {
        // Otherwise, create a new log
        response = await axiosInstance.post(`/api/expenses/${currentExpense.id}/update_recurring/`, formData);
      }
  
      if (response.status === 200 || response.status === 201) {
        refetch();
        setOpenDialog(false);
        setCurrentExpense(null);
        setNewAmount('');
        setEffectiveDate(dayjs());
        setErrorMessage('');
      } else {
        throw new Error('Failed to save the recurring amount');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      setErrorMessage(error.response?.data?.effective_date?.[0] || 'Failed to save the recurring amount. Please check your input and try again.');
    }
  };
  

  const handleEdit = (expense) => {
    setEditingExpenseId(expense.id);
    setCurrentExpense(expense);
    setNewAmount(expense.effective_amount || expense.amount);
    setEffectiveDate(dayjs());
    setOpenDialog(true);
  };

  const handleUpdateRecurring = (expenseId) => {
    const expense = selectedExpenses.find((exp) => exp.id === expenseId);
    if (expense) {
      setCurrentExpense(expense);  // Set the current expense with the correct ID
      setNewAmount(expense.effective_amount || expense.amount);
      setEffectiveDate(dayjs());
      setOpenDialog(true);  // Open the dialog
    } else {
      console.error('Expense not found for the given ID:', expenseId);
    }
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
            onCancel={() => setEditingExpenseId(null)}
            onSave={handleSave}
            onDelete={() => setEditingExpenseId(null)}
            onUpdateRecurring={handleUpdateRecurring} // Pass the handleUpdateRecurring to the ExpenseTable
            categories={categories}
            creditCards={creditCards}
            isDeleting={isDeleting}
          />
        </Container>
      </div>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editingExpenseId ? "Edit Existing Recurring Amount" : "Create New Recurring Amount"}</DialogTitle>
        <DialogContent>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <TextField
            label="New Amount"
            type="number"
            fullWidth
            margin="dense"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
            InputLabelProps={{
              style: { color: '#ffffff' }  // Set label color to white
            }}
          />
          <TextField
            label="Effective Date"
            type="date"
            fullWidth
            margin="dense"
            value={effectiveDate.format('YYYY-MM-DD')}
            onChange={(e) => setEffectiveDate(dayjs(e.target.value))}
            InputLabelProps={{
              style: { color: '#ffffff' }  // Set label color to white
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ViewExpenses;
