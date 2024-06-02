import React, { useState, useEffect } from 'react';
import { DateCalendar } from '@mui/x-date-pickers';
import { TextField, IconButton, Container, Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Header from '../components/Header';
import SidebarMenu from '../components/SidebarMenu';
import { useAuth } from '../hooks/useAuth';
import dayjs from 'dayjs';

const ViewIncomes = () => {
  const { logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [startDate, setStartDate] = useState(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState(dayjs().endOf('month'));
  const [incomes, setIncomes] = useState([]);
  const [selectedIncomes, setSelectedIncomes] = useState([]);

  useEffect(() => {
    fetchIncomes(startDate, endDate);
  }, [startDate, endDate]);

  const fetchIncomes = (start, end) => {
    // Fetch incomes from your API or data source
    // Replace with actual fetch call
    const fetchedIncomes = [
      { id: 1, description: 'Salary', date: '2024-06-01', amount: 5000, recurring: true },
      { id: 2, description: 'Freelance', date: '2024-06-15', amount: 1200, recurring: false },
      // Add more sample data as needed
    ];
    setIncomes(fetchedIncomes);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    const incomesForSelectedDate = incomes.filter(income => dayjs(income.date).isSame(date, 'day'));
    setSelectedIncomes(incomesForSelectedDate);
  };

  const handleDateRangeChange = (start, end) => {
    if (dayjs(end).diff(dayjs(start), 'day') > 31) {
      alert('Please select a date range within 31 days.');
      return;
    }
    setStartDate(start);
    setEndDate(end);
    fetchIncomes(start, end);
  };

  const handleEdit = (id) => {
    // Implement edit income functionality
  };

  const handleDelete = (id) => {
    // Implement delete income functionality
  };

  const renderDay = (date, selectedDates, pickersDayProps) => {
    const isRecurring = incomes.some(income => income.recurring && dayjs(income.date).date() === date.date());
    const isIncomeDay = incomes.some(income => !income.recurring && dayjs(income.date).isSame(date, 'day'));
    
    return (
      <Box
        {...pickersDayProps}
        sx={{
          border: (isRecurring || isIncomeDay) ? '2px solid #1976d2' : undefined,
          borderRadius: '50%',
          backgroundColor: (isRecurring || isIncomeDay) ? '#1976d2' : undefined,
          color: (isRecurring || isIncomeDay) ? '#fff' : undefined,
        }}
      />
    );
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
          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => handleDateRangeChange(newValue, endDate)}
              renderInput={(params) => <TextField {...params} />}
              sx={{ flex: 1 }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => handleDateRangeChange(startDate, newValue)}
              renderInput={(params) => <TextField {...params} />}
              sx={{ flex: 1 }}
            />
          </Box>
          <DateCalendar 
            date={selectedDate} 
            onChange={handleDateChange} 
            renderDay={renderDay}
            sx={{
              margin: '0 auto',
              maxWidth: '100%',
              backgroundColor: '#1c2330',
              color: '#fff',
              '& .MuiPickersDay-root': {
                color: '#fff',
              },
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#1c2330',
                color: '#fff',
              },
              '& .MuiSvgIcon-root': {
                color: '#fff',
              },
            }}
          />
        </LocalizationProvider>
        <Container>
          {selectedIncomes.length > 0 && (
            <List>
              {selectedIncomes.map(income => (
                <ListItem key={income.id} sx={{ justifyContent: 'space-between' }}>
                  <ListItemText primary={income.description} secondary={dayjs(income.date).format('MMMM D, YYYY')} />
                  <ListItemText primary={`$${income.amount}`} />
                  <IconButton onClick={() => handleEdit(income.id)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(income.id)}>
                    <Delete />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}
        </Container>
      </div>
    </div>
  );
};

export default ViewIncomes;
