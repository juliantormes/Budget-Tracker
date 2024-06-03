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
import { useFetchFinancialData } from '../hooks/useFetchFinancialData';
import dayjs from 'dayjs';

const ViewIncomes = () => {
  const { logout } = useAuth();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [startDate, setStartDate] = useState(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState(dayjs().endOf('month'));
  const { data, loading, error } = useFetchFinancialData(dayjs().year(), dayjs().month() + 1);
  const [selectedIncomes, setSelectedIncomes] = useState([]);

  useEffect(() => {
    if (data.incomes.length > 0) {
      fetchIncomes(startDate, endDate);
    }
  }, [startDate, endDate, data]);

  const fetchIncomes = (start, end) => {
    const fetchedIncomes = data.incomes.filter(income =>
      dayjs(income.date).isBetween(start, end, null, '[]')
    );
    setSelectedIncomes(fetchedIncomes);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    // Check if the selected date is outside the current range
    if (!date.isBetween(startDate, endDate, null, '[]')) {
      const newStartDate = date.startOf('month');
      const newEndDate = date.endOf('month');
      handleDateRangeChange(newStartDate, newEndDate);
    } else {
      const incomesForSelectedDate = data.incomes.filter(income => dayjs(income.date).isSame(date, 'day'));
      setSelectedIncomes(incomesForSelectedDate);
    }
  };

  const handleDateRangeChange = (start, end) => {
    if (dayjs(end).diff(dayjs(start), 'day') > 31) {
      alert('Please select a date range within 31 days.');
      return;
    }
    setStartDate(start);
    setEndDate(end);
    fetchIncomes(start, end);
    setSelectedDate(start); // Update selected date to reflect the new range
  };

  const handleEdit = (id) => {
    // Implement edit income functionality
  };

  const handleDelete = (id) => {
    // Implement delete income functionality
  };

  const renderDay = (date, selectedDates, pickersDayProps) => {
    const isRecurring = data.incomes.some(income => income.recurring && dayjs(income.date).date() === date.date());
    const isIncomeDay = data.incomes.some(income => !income.recurring && dayjs(income.date).isSame(date, 'day'));

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
          <Box sx={{ display: 'flex', gap: 2, mb: 4, justifyContent: 'center' }}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => handleDateRangeChange(newValue, endDate)}
              renderInput={(params) => <TextField {...params} />}
              sx={{
                flex: 1,
                maxWidth: 200,
                '& .MuiInputBase-input': {
                  color: '#fff',
                },
                '& .MuiInputLabel-root': {
                  color: '#fff',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#fff',
                  },
                  '&:hover fieldset': {
                    borderColor: '#fff',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#fff',
                  },
                }
              }}
            />
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => handleDateRangeChange(startDate, newValue)}
              renderInput={(params) => <TextField {...params} />}
              sx={{
                flex: 1,
                maxWidth: 200,
                '& .MuiInputBase-input': {
                  color: '#fff',
                },
                '& .MuiInputLabel-root': {
                  color: '#fff',
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#fff',
                  },
                  '&:hover fieldset': {
                    borderColor: '#fff',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#fff',
                  },
                }
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
            <DateCalendar
              date={selectedDate}
              onChange={handleDateChange}
              renderDay={renderDay}
              sx={{
                backgroundColor: '#1c2330',
                color: '#fff',
                '& .MuiPickersDay-root': {
                  color: '#fff',
                },
                '& .MuiPickersDay-root.Mui-selected': {
                  backgroundColor: '#1976d2',
                  color: '#fff',
                },
                '& .MuiPickersCalendarHeader-root': {
                  color: '#fff',
                },
                '& .MuiPickersCalendarHeader-label': {
                  color: '#fff',
                },
                '& .MuiSvgIcon-root': {
                  color: '#fff',
                },
                '& .MuiTypography-root': {
                  color: '#fff',
                },
              }}
            />
          </Box>
        </LocalizationProvider>
        <Container>
          {loading ? (
            <Typography variant="h6" color="textSecondary">Loading...</Typography>
          ) : error ? (
            <Typography variant="h6" color="error">Error: {error.message}</Typography>
          ) : selectedIncomes.length > 0 ? (
            <List>
              {selectedIncomes.map(income => (
                <ListItem key={income.id} sx={{ justifyContent: 'space-between', backgroundColor: '#1c2330', color: '#fff', mb: 2, borderRadius: 1 }}>
                  <ListItemText primary={income.category_name} secondary={dayjs(income.date).format('MMMM D, YYYY')} sx={{ color: '#fff' }} />
                  <ListItemText primary={`$${Number(income.amount).toFixed(2)}`} sx={{ color: '#fff' }} />
                  <IconButton onClick={() => handleEdit(income.id)} sx={{ color: '#fff' }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(income.id)} sx={{ color: '#fff' }}>
                    <Delete />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="h6" color="textSecondary">No incomes for the selected date.</Typography>
          )}
        </Container>
      </div>
    </div>
  );
};

export default ViewIncomes;
