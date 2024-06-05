import React from 'react';
import { TextField, Box } from '@mui/material';
import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const DatePicker = ({ dateRange, handleDateRangeChange, isValidRange }) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Box className="date-picker-container">
      <DateRangePicker
        startText="Start Date"
        endText="End Date"
        value={dateRange}
        onChange={handleDateRangeChange}
        renderInput={(startProps, endProps) => (
          <>
            <TextField {...startProps} className="date-picker-input" />
            <Box sx={{ mx: 2 }}> to </Box>
            <TextField {...endProps} className="date-picker-input" />
          </>
        )}
      />
    </Box>
  </LocalizationProvider>
);

export default DatePicker;
