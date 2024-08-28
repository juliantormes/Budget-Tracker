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

const ViewIncomes = () => {
  const { logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const { data, refetch } = useFetchFinancialData(selectedDate.year(), selectedDate.month() + 1);
  const [selectedIncomes, setSelectedIncomes] = useState([]);
  const [isValidRange, setIsValidRange] = useState(true);
  const [editingIncomeId, setEditingIncomeId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const [openDialog, setOpenDialog] = useState(false);
  const [currentIncome, setCurrentIncome] = useState(null);
  const [newAmount, setNewAmount] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(dayjs());
  const [errorMessage, setErrorMessage] = useState(''); // For error notifications

  useEffect(() => {
    if (currentIncome) {
      setNewAmount(currentIncome.effective_amount || currentIncome.amount);  // Set the default value to the current amount
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
    try {
      const response = await axiosInstance.get('/api/income_categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
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
  
    const formData = {
      new_amount: parseFloat(newAmount),
      effective_date: effectiveDate.format('YYYY-MM-DD'),
    };
  
    try {
      // Check if there's already a change log for this month
      const existingLog = currentIncome.change_logs.find(log =>
        dayjs(log.effective_date).isSame(effectiveDate, 'month')
      );
  
      let response;
      if (existingLog) {
        // If a log exists for the current month, update it
        response = await axiosInstance.put(`/api/incomes/${currentIncome.id}/update_recurring/`, formData);
      } else {
        // Otherwise, create a new log
        response = await axiosInstance.post(`/api/incomes/${currentIncome.id}/update_recurring/`, formData);
      }
  
      if (response.status === 200 || response.status === 201) {
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
      console.error('Error saving income:', error);
      setErrorMessage(error.response?.data?.effective_date?.[0] || 'Failed to save the recurring amount. Please check your input and try again.');
    }
  };
  

  const handleEdit = (income) => {
    setEditingIncomeId(income.id);
    setCurrentIncome(income);
    setNewAmount(income.effective_amount || income.amount);
    setEffectiveDate(dayjs());
    setOpenDialog(true);
  };

  const handleUpdateRecurring = (incomeId) => {
    const income = selectedIncomes.find((inc) => inc.id === incomeId);
    if (income) {
      setCurrentIncome(income);  // Set the current income with the correct ID
      setNewAmount(income.effective_amount || income.amount);
      setEffectiveDate(dayjs());
      setOpenDialog(true);  // Open the dialog
    } else {
      console.error('Income not found for the given ID:', incomeId);
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
            onDelete={() => setEditingIncomeId(null)}
            onUpdateRecurring={handleUpdateRecurring} // Pass the handleUpdateRecurring to the IncomeTable
            categories={categories}
            isDeleting={isDeleting}
          />
        </Container>
      </div>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editingIncomeId ? "Edit Existing Recurring Amount" : "Create New Recurring Amount"}</DialogTitle>
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
          <Button onClick={() => setOpenDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ViewIncomes;
