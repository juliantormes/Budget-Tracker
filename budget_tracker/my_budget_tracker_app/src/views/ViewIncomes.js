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
import '../styles/ViewIncomes.css';
import IncomeTable from '../components/IncomeTable';

const ViewIncomes = ({ categories: categoriesProp }) => {
  const { logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const { data, refetch } = useFetchFinancialData(selectedDate.year(), selectedDate.month() + 1);
  const [selectedIncomes, setSelectedIncomes] = useState([]);
  const [isValidRange, setIsValidRange] = useState(true);
  const [editingIncomeId, setEditingIncomeId] = useState(null);
  const [categories, setCategories] = useState(categoriesProp || []);
  const [isDeleting, setIsDeleting] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [currentIncome, setCurrentIncome] = useState(null);
  const [newAmount, setNewAmount] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(dayjs());
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (currentIncome) {
      setNewAmount(currentIncome.effective_amount || currentIncome.amount);
    }
  }, [currentIncome]);

  const fetchIncomes = useCallback((start, end) => {
    const fetchedIncomes = data.incomes.filter(income =>
      dayjs(income.date).isBetween(start, end, null, '[]')
    );
    setSelectedIncomes(fetchedIncomes);
  }, [data]);

  useEffect(() => {
    if (isValidRange && data.incomes.length > 0) {
      fetchIncomes(dateRange[0], dateRange[1]);
    }
  }, [dateRange, data, isValidRange, fetchIncomes]);

  const fetchCategories = async () => {
    if (!categoriesProp) {
      try {
        const response = await axiosInstance.get('/api/income_categories/');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const incomesForSelectedDate = data.incomes.filter(income => dayjs(income.date).isSame(date, 'day'));
    setSelectedIncomes(incomesForSelectedDate);
  };

  const handleDateRangeChange = (newValue) => {
    if (dayjs(newValue[1]).diff(dayjs(newValue[0]), 'day') > 31) {
      setIsValidRange(false);
    } else {
      setIsValidRange(true);
      setDateRange(newValue);
      fetchIncomes(newValue[0], newValue[1]);
      setSelectedDate(newValue[0]);
    }
  };

  const handleMonthChange = (date) => {
    const newStartDate = date.startOf('month');
    const newEndDate = date.endOf('month');
    setDateRange([newStartDate, newEndDate]);
    setSelectedDate(newStartDate);
    fetchIncomes(newStartDate, newEndDate);
  };

  const handleSave = async () => {
    if (!currentIncome || !currentIncome.id) {
      setErrorMessage('Error: Cannot update income because the necessary data is missing.');
      return;
    }
    try {
      const response = await axiosInstance.put(`/api/incomes/${currentIncome.id}/`, currentIncome);
      if (response.status === 200 || response.status === 201) {
        refetch();
        setEditingIncomeId(null);
        setCurrentIncome(null);
        setErrorMessage('');
      } else {
        throw new Error('Failed to save the income');
      }
    } catch (error) {
      console.error('Error saving income:', error);
      setErrorMessage('Failed to save the income. Please try again.');
    }
  };

  const handleEdit = (income) => {
    setEditingIncomeId(income.id);
    setCurrentIncome(income);
  };

  const handleUpdateRecurring = (incomeId) => {
    const income = selectedIncomes.find((inc) => inc.id === incomeId);
    if (income) {
      setCurrentIncome(income);
      setNewAmount(income.effective_amount || income.amount);
      setEffectiveDate(dayjs());
      setOpenDialog(true);
    } else {
      console.error('Income not found for the given ID:', incomeId);
    }
  };

  const handleDelete = async (incomeId) => {
    setIsDeleting(true);
    try {
      const response = await axiosInstance.delete(`/api/incomes/${incomeId}/`);
      if (response.status === 204) {
        refetch();
      } else {
        throw new Error('Failed to delete the income');
      }
    } catch (error) {
      console.error('Error deleting income:', error);
      setErrorMessage('Failed to delete the income. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveRecurringUpdate = async () => {
    if (!currentIncome || !currentIncome.id) {
      setErrorMessage('Error: Cannot update recurring income because the necessary data is missing.');
      return;
    }
    const formData = {
      new_amount: parseFloat(newAmount),
      effective_date: effectiveDate.format('YYYY-MM-DD'),
    };
    try {
      const existingLog = currentIncome.change_logs.find(log =>
        dayjs(log.effective_date).isSame(effectiveDate, 'month')
      );

      let response;
      if (existingLog) {
        response = await axiosInstance.put(`/api/incomes/${currentIncome.id}/update_recurring/`, formData);
      } else {
        response = await axiosInstance.post(`/api/incomes/${currentIncome.id}/update_recurring/`, formData);
      }

      if (response.status === 200 || response.status === 201) {
        const updatedIncome = response.data;

        setSelectedIncomes(prevIncomes =>
          prevIncomes.map(inc => (inc.id === updatedIncome.id ? { ...updatedIncome } : inc))
        );

        await new Promise(resolve => setTimeout(resolve, 500));
        refetch();
        setOpenDialog(false);
        setCurrentIncome(null);
        setNewAmount('');
        setEffectiveDate(dayjs());
        setErrorMessage('');
      } else {
        throw new Error('Failed to save the recurring amount');
      }
    } catch (error) {
      console.error('Error saving recurring update:', error);
      setErrorMessage('Failed to save the recurring amount. Please try again.');
    }
  };

  return (
    <div className="view-incomes">
      <div className="sidebar-container">
        <SidebarMenu />
      </div>
      <div className="content">
        <Header logout={logout} />
        <Typography variant="h4" gutterBottom>View Incomes</Typography>
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
          <IncomeTable
            incomes={selectedIncomes}
            editingIncomeId={editingIncomeId}
            onEdit={handleEdit}
            onCancel={() => setEditingIncomeId(null)}
            onSave={handleSave}
            onDelete={handleDelete}
            onUpdateRecurring={handleUpdateRecurring}
            categories={categories}
            isDeleting={isDeleting}
          />
        </Container>
      </div>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Update Recurring Income</DialogTitle>
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
              style: { color: '#ffffff' }
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
              style: { color: '#ffffff' }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveRecurringUpdate} color="primary">
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

export default ViewIncomes;
