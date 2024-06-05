import React from 'react';
import { Box } from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers';
import dayjs from 'dayjs';

const Calendar = ({ selectedDate, handleDateChange, handleMonthChange, data }) => {
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
    <Box className="calendar-container">
      <DateCalendar
        value={selectedDate}
        onChange={handleDateChange}
        onMonthChange={handleMonthChange}
        renderDay={renderDay}
      />
    </Box>
  );
};

export default Calendar;
