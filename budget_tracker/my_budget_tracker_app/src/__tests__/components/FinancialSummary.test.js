import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FinancialSummary from '../../components/FinancialSummary';
import Chart from '../../components/Chart';
import { Bar } from 'react-chartjs-2';

// Mock Chart component
jest.mock('../../components/Chart', () => (props) => (
  <div data-testid="chart-mock">{JSON.stringify(props)}</div>
));

// Mock Bar component from 'react-chartjs-2'
jest.mock('react-chartjs-2', () => ({
  Bar: (props) => <div data-testid="bar-chart-mock">{JSON.stringify(props)}</div>,
}));

const mockGoToPreviousMonth = jest.fn();
const mockGoToNextMonth = jest.fn();

const incomeChartData = { datasets: [{ data: [1000] }] };
const expenseChartData = { datasets: [{ data: [500] }] };
const creditCardChartData = { datasets: [{ data: [200] }] };
const barChartData = { datasets: [{ data: [1500, 500] }] };

describe('FinancialSummary Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all the elements correctly', () => {
    render(
      <FinancialSummary
        incomeChartData={incomeChartData}
        expenseChartData={expenseChartData}
        creditCardChartData={creditCardChartData}
        totalIncome={1000}
        totalExpenses={500}
        totalCreditCardDebt={200}
        net={300}
        barChartData={barChartData}
        year={2024}
        month={10}
        goToPreviousMonth={mockGoToPreviousMonth}
        goToNextMonth={mockGoToNextMonth}
      />
    );

    // Verify that the correct year and month are displayed
    expect(screen.getByText(/2024 - 10/i)).toBeInTheDocument();

    // Verify the net income is displayed
    expect(screen.getByText(/Net: \$300/i)).toBeInTheDocument();

    // Check that pie charts are rendered correctly
    expect(screen.getAllByTestId('chart-mock')).toHaveLength(3);

    // Check that the bar chart is rendered
    expect(screen.getByTestId('bar-chart-mock')).toBeInTheDocument();
  });

  it('calls goToPreviousMonth when the previous button is clicked', () => {
    render(
      <FinancialSummary
        incomeChartData={incomeChartData}
        expenseChartData={expenseChartData}
        creditCardChartData={creditCardChartData}
        totalIncome={1000}
        totalExpenses={500}
        totalCreditCardDebt={200}
        net={300}
        barChartData={barChartData}
        year={2024}
        month={10}
        goToPreviousMonth={mockGoToPreviousMonth}
        goToNextMonth={mockGoToNextMonth}
      />
    );

    // Click the Previous Month button
    fireEvent.click(screen.getByText(/Previous Month/i));

    // Verify that the callback function was called
    expect(mockGoToPreviousMonth).toHaveBeenCalledTimes(1);
  });

  it('calls goToNextMonth when the next button is clicked', () => {
    render(
      <FinancialSummary
        incomeChartData={incomeChartData}
        expenseChartData={expenseChartData}
        creditCardChartData={creditCardChartData}
        totalIncome={1000}
        totalExpenses={500}
        totalCreditCardDebt={200}
        net={300}
        barChartData={barChartData}
        year={2024}
        month={10}
        goToPreviousMonth={mockGoToPreviousMonth}
        goToNextMonth={mockGoToNextMonth}
      />
    );

    // Click the Next Month button
    fireEvent.click(screen.getByText(/Next Month/i));

    // Verify that the callback function was called
    expect(mockGoToNextMonth).toHaveBeenCalledTimes(1);
  });
});
