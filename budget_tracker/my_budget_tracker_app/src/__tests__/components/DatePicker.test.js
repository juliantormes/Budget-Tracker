import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DatePicker from '../../components/DatePicker';
import dayjs from 'dayjs';

describe('DatePicker', () => {
  const mockHandleDateRangeChange = jest.fn();

  const defaultProps = {
    dateRange: [dayjs('2023-10-01'), dayjs('2023-10-15')],
    handleDateRangeChange: mockHandleDateRangeChange,
    isValidRange: true,
  };

  beforeEach(() => {
    mockHandleDateRangeChange.mockClear();
  });

  it('renders the date range inputs correctly', () => {
    render(<DatePicker {...defaultProps} />);

    // The labels are "Start" and "End", not "Start Date" or "End Date"
    expect(screen.getByLabelText(/Start/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/End/i)).toBeInTheDocument();
  });

  it('calls handleDateRangeChange when the date range is changed', () => {
    render(<DatePicker {...defaultProps} />);

    const startDateInput = screen.getByLabelText(/Start/i);
    const endDateInput = screen.getByLabelText(/End/i);

    fireEvent.change(startDateInput, { target: { value: '2023-10-05' } });
    fireEvent.change(endDateInput, { target: { value: '2023-10-20' } });

    expect(mockHandleDateRangeChange).toHaveBeenCalled();
  });

  it('renders the correct date range values in the inputs', () => {
    render(<DatePicker {...defaultProps} />);

    const startDateInput = screen.getByLabelText(/Start/i);
    const endDateInput = screen.getByLabelText(/End/i);

    expect(startDateInput.value).toBe('10/01/2023'); // Format may vary depending on locale settings
    expect(endDateInput.value).toBe('10/15/2023');
  });
});
