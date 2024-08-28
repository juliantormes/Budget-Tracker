import React, { useState, useEffect, useCallback} from 'react';
import { Container, Typography, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button } from '@mui/material';
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

  useEffect(() => {
    if (currentIncome) {
      setNewAmount(currentIncome.amount);  // Set the default value to the current amount
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

  const handleSave = async (formData) => {
    try {
      const response = await axiosInstance.put(`/api/incomes/${editingIncomeId}/`, formData);
      if (response.status === 200) {
        refetch();
        setEditingIncomeId(null);
      } else {
        throw new Error('Failed to update income');
      }
    } catch (error) {
      console.error('Error updating income:', error);
    }
  };

  const handleDelete = async (incomeId) => {
    if (isDeleting) return;

    setIsDeleting(true);

    try {
      const response = await axiosInstance.delete(`/api/incomes/${incomeId}/`);
      if (response.status === 204) {
        refetch();
      } else {
        throw new Error('Failed to delete income');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (income) => {
    setEditingIncomeId(income.id);
  };

  const handleCancel = () => {
    setEditingIncomeId(null);
  };

  const handleUpdateRecurring = (incomeId) => {
    const income = selectedIncomes.find((inc) => inc.id === incomeId);
    setCurrentIncome(income);
    setOpenDialog(true);
  };

  const handleDialogSave = async () => {
    try {
      const response = await axiosInstance.post(`/api/incomes/${currentIncome.id}/update_recurring/`, {
        new_amount: newAmount,
        effective_date: effectiveDate.format('YYYY-MM-DD'),
      });
      if (response.status === 200) {
        refetch();
        setOpenDialog(false);
        setCurrentIncome(null);
        setNewAmount('');
        setEffectiveDate(dayjs());
      } else {
        throw new Error('Failed to update recurring amount');
      }
    } catch (error) {
      console.error('Error updating recurring amount:', error);
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
            onCancel={handleCancel}
            onSave={handleSave}
            onDelete={handleDelete}
            onUpdateRecurring={handleUpdateRecurring} // Pass the handler to EditableRow
            categories={categories}
            isDeleting={isDeleting}
          />
        </Container>
      </div>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Update Recurring Amount</DialogTitle>
        <DialogContent>
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
          <Button onClick={handleDialogSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ViewIncomes;
