import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useFetchFinancialData } from '../../hooks/useFetchFinancialData';
import * as chartUtils from '../../utils/chartUtils'; // Mock this
import { useFetchYearData } from '../../hooks/useFetchYearData'; // Mock this

// Mock dependencies
jest.mock('../../hooks/useFetchYearData');
jest.mock('../../utils/chartUtils');

// Test component to use the hook
function TestComponent({ year, month }) {
  const {
    data,
    loading,
    error,
    totalIncome,
    totalExpenses,
    totalCreditCardDebt,
    net,
  } = useFetchFinancialData(year, month);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <p>Incomes: {data.incomes.length}</p>
      <p>Expenses: {data.expenses.length}</p>
      <p>Credit Card Expenses: {data.creditCardExpenses.length}</p>
      <p>Total Income: {totalIncome}</p>
      <p>Total Expenses: {totalExpenses}</p>
      <p>Total Credit Card Debt: {totalCreditCardDebt}</p>
      <p>Net: {net}</p>
    </div>
  );
}

describe('useFetchFinancialData Hook in React component', () => {
  beforeEach(() => {
    // Mock chartUtils methods to return dummy values
    chartUtils.prepareIncomeChartData.mockReturnValue({ datasets: [{ data: [1000] }] });
    chartUtils.prepareExpenseChartData.mockReturnValue({ datasets: [{ data: [500] }] });
    chartUtils.prepareCreditCardChartData.mockReturnValue({ datasets: [{ data: [200] }] });
    chartUtils.calculateTotalIncome.mockReturnValue(1000);
    chartUtils.calculateTotalExpenses.mockReturnValue(500);
    chartUtils.calculateTotalCreditCardDebt.mockReturnValue(200);
    chartUtils.calculateNet.mockReturnValue(300);
    chartUtils.calculatePercentages.mockReturnValue({
      cashFlowPercentage: '50.00',
      creditCardPercentage: '20.00',
      netPercentage: '30.00',
    });
    chartUtils.prepareBarChartData.mockReturnValue({
      labels: ['Net', 'Cash Flow', 'Credit Card'],
      datasets: [{ data: ['30.00', '50.00', '20.00'] }],
    });

    // Mock useFetchYearData to return a dummy function that resolves data
    useFetchYearData.mockReturnValue(jest.fn(() => Promise.resolve({
      incomes: [{ id: 1, amount: 1000 }],
      expenses: [{ id: 1, amount: 500 }],
      creditCardExpenses: [{ id: 1, amount: 200 }],
    })));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and display financial data', async () => {
    render(<TestComponent year={2024} month={1} />);

    // Check if the loading state is rendered initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for the data to be fetched and rendered
    await waitFor(() => {
      expect(screen.getByText('Incomes: 1')).toBeInTheDocument();
      expect(screen.getByText('Expenses: 1')).toBeInTheDocument();
      expect(screen.getByText('Credit Card Expenses: 1')).toBeInTheDocument();
      expect(screen.getByText('Total Income: 1000')).toBeInTheDocument();
      expect(screen.getByText('Total Expenses: 500')).toBeInTheDocument();
      expect(screen.getByText('Total Credit Card Debt: 200')).toBeInTheDocument();
      expect(screen.getByText('Net: 300')).toBeInTheDocument();
    });
  });

  it('should show error if fetch fails', async () => {
    // Simulate an error in fetching data
    useFetchYearData.mockReturnValue(jest.fn(() => Promise.reject(new Error('Fetch error'))));

    render(<TestComponent year={2024} month={1} />);

    // Wait for the error message to be rendered
    await waitFor(() => {
      expect(screen.getByText('Error: Fetch error')).toBeInTheDocument();
    });
  });
});
