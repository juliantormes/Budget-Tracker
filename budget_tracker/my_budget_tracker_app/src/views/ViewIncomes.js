import React, { useState, useEffect, useCallback } from 'react';
import { Container, Typography } from '@mui/material';
import Header from '../components/Header';
import SidebarMenu from '../components/SidebarMenu';
import { useAuth } from '../hooks/useAuth';
import { useFetchFinancialData } from '../hooks/useFetchFinancialData';
import dayjs from 'dayjs';
import IncomeList from '../components/IncomeList';
import DatePicker from '../components/DatePicker';
import Calendar from '../components/Calendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import EditIncomeDialog from '../components/EditIncomeDialog';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import '../styles/ViewIncomes.css';
import axiosInstance from '../api/axiosApi';

const ViewIncomes = () => {
  const { logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const { data, loading, error, refetch } = useFetchFinancialData(selectedDate.year(), selectedDate.month() + 1);
  const [selectedIncomes, setSelectedIncomes] = useState([]);
  const [isValidRange, setIsValidRange] = useState(true);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentIncome, setCurrentIncome] = useState(null);

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

  const handleEdit = (income) => {
    setCurrentIncome(income);
    setOpenEditDialog(true);
  };

  const handleDelete = (income) => {
    setCurrentIncome(income);
    setOpenDeleteDialog(true);
  };

  const handleSave = async (updatedIncome) => {
    try {
      const response = await axiosInstance.put(`/api/incomes/${updatedIncome.id}/`, updatedIncome);
      if (response.status === 200) {
        refetch();
        setOpenEditDialog(false);
        setCurrentIncome(null); // Reset currentIncome after saving
      } else {
        throw new Error('Failed to update income');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmDelete = async (incomeId) => {
    try {
      const response = await axiosInstance.delete(`/api/incomes/${incomeId}/`);
      if (response.status === 204) {
        refetch();
        setOpenDeleteDialog(false);
        setCurrentIncome(null); // Reset currentIncome after deletion
      } else {
        throw new Error('Failed to delete income');
      }
    } catch (error) {
      console.error('Error deleting income:', error);
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
        <Container>
          {loading ? (
            <Typography variant="h6" color="textSecondary">Loading...</Typography>
          ) : error ? (
            <Typography variant="h6" color="error">Error: {error.message}</Typography>
          ) : selectedIncomes.length > 0 ? (
            <IncomeList incomes={selectedIncomes} handleEdit={handleEdit} handleDelete={handleDelete} />
          ) : (
            <Typography variant="h6" color="textSecondary">No incomes for the selected date.</Typography>
          )}
        </Container>
      </div>
      {currentIncome && (
        <EditIncomeDialog
          open={openEditDialog}
          income={currentIncome}
          onClose={() => setOpenEditDialog(false)}
          onSave={handleSave}
        />
      )}
      {currentIncome && (
        <DeleteConfirmDialog
          open={openDeleteDialog}
          incomeId={currentIncome.id}
          onClose={() => setOpenDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
};

export default ViewIncomes;
