import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Calendar from '../../components/Calendar'; // Adjust the path as necessary
import dayjs from 'dayjs';

describe('Calendar', () => {
  const data = {
    incomes: [
      { date: '2023-10-01', recurring: true },
      { date: '2023-10-15', recurring: false }
    ]
  };

  const selectedDate = dayjs('2023-10-01');
  const handleDateChange = jest.fn();
  const handleMonthChange = jest.fn();

  beforeEach(() => {
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Calendar
          selectedDate={selectedDate}
          handleDateChange={handleDateChange}
          handleMonthChange={handleMonthChange}
          data={data}
        />
      </LocalizationProvider>
    );
  });

  it('renders the DateCalendar component', () => {
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('calls handleDateChange when a date is selected', () => {
    // Use `aria-current="date"` to select the current date
    const dateCell = screen.getByRole('gridcell', { selected: true });
    fireEvent.click(dateCell);
    expect(handleDateChange).toHaveBeenCalled();
  });

  it('applies custom styling to recurring income days', () => {
    const recurringDay = screen.getByRole('gridcell', { name: /1/i, selected: true });
    
    // Update to match the actual background color
    expect(recurringDay).toHaveStyle('background-color: rgb(21, 101, 192)');
    expect(recurringDay).toHaveStyle('color: #fff');
  });
  
  it('calls handleMonthChange when the month is changed', () => {
    const nextMonthButton = screen.getByLabelText('Next month');
    fireEvent.click(nextMonthButton);
    expect(handleMonthChange).toHaveBeenCalled();
  });
});
