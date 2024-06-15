import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
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
import EditableRow from '../components/EditableRow';

const ViewExpenses = () => {
  const { logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const { data, loading, error, refetch } = useFetchFinancialData(selectedDate.year(), selectedDate.month() + 1);
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [isValidRange, setIsValidRange] = useState(true);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [categories, setCategories] = useState([]);

  const fetchExpenses = useCallback((start, end) => {
    const fetchedExpenses = data.expenses.filter(expense =>
      dayjs(expense.date).isBetween(start, end, null, '[]')
    );
    console.log('Fetched expenses:', fetchedExpenses); // Log fetched expenses
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const expensesForSelectedDate = data.expenses.filter(expense => dayjs(expense.date).isSame(date, 'day'));
    setSelectedExpenses(expensesForSelectedDate);
    console.log('Expenses for selected date:', expensesForSelectedDate);
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
    console.log('Date range changed:', newValue);
  };

  const handleMonthChange = (date) => {
    const newStartDate = date.startOf('month');
    const newEndDate = date.endOf('month');
    setDateRange([newStartDate, newEndDate]);
    setSelectedDate(newStartDate);
    fetchExpenses(newStartDate, newEndDate);
    console.log('Month changed:', newStartDate, newEndDate);
  };

  const handleSave = async (formData) => {
    console.log('Saving expense:', formData);
    try {
      const response = await axiosInstance.put(`/api/expenses/${editingExpenseId}/`, formData);
      if (response.status === 200) {
        refetch();
        setEditingExpenseId(null);
        console.log('Save successful');
      } else {
        throw new Error('Failed to update expense');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDelete = async (expenseId) => {
    console.log('Deleting expense:', expenseId);
    try {
      const response = await axiosInstance.delete(`/api/expenses/${expenseId}/`);
      if (response.status === 204) {
        refetch();
        console.log('Delete successful');
      } else {
        throw new Error('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpenseId(expense.id);
    console.log('Editing expense:', expense);
  };

  const handleCancel = () => {
    setEditingExpenseId(null);
    console.log('Editing cancelled');
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
          <Table className="table">
            <TableHead>
              <TableRow className="table-header">
                <TableCell>Category</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Recurring</TableCell>
                <TableCell>Paid with Credit Card</TableCell>
                <TableCell>Credit Card</TableCell>
                <TableCell>Installments</TableCell>
                <TableCell>Surcharge</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedExpenses.map((expense) => (
                <EditableRow
                  key={expense.id}
                  item={expense}
                  isEditing={editingExpenseId === expense.id}
                  onEdit={handleEdit}
                  onCancel={handleCancel}
                  onSave={handleSave}
                  onDelete={handleDelete}
                  categories={categories}
                  type="expense"
                />
              ))}
            </TableBody>
          </Table>
        </Container>
      </div>
    </div>
  );
};

export default ViewExpenses;
