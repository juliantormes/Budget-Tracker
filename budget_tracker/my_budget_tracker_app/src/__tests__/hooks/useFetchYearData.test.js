import { renderHook, act } from '@testing-library/react';
import { useFetchYearData } from '../../hooks/useFetchYearData';  // Adjust the path as per your project structure
import axiosInstance from '../../api/axiosApi';  // Mock this

// Mock axiosInstance
jest.mock('../../api/axiosApi');

describe('useFetchYearData', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch incomes, expenses, and credit card expenses for the given year', async () => {
        // Mock axios responses
        const mockIncomes = [{ id: 1, amount: 1000 }];
        const mockExpenses = [{ id: 1, amount: 500 }];
        const mockCreditCardExpenses = [{ id: 1, amount: 200 }];
        
        axiosInstance.get
            .mockResolvedValueOnce({ data: mockIncomes })    // For incomes
            .mockResolvedValueOnce({ data: mockExpenses })   // For expenses
            .mockResolvedValueOnce({ data: mockCreditCardExpenses }); // For credit card expenses

        const { result } = renderHook(() => useFetchYearData());

        let data;
        await act(async () => {
            data = await result.current(2024);  // Pass the year as 2024
        });

        // Check if axiosInstance.get was called with correct URLs
        expect(axiosInstance.get).toHaveBeenCalledWith('incomes/?year=2024&include_recurring=true');
        expect(axiosInstance.get).toHaveBeenCalledWith('expenses/?year=2024&include_recurring=true');
        expect(axiosInstance.get).toHaveBeenCalledWith('credit-card-expenses/?year=2024&include_recurring=true');

        // Check the returned data
        expect(data.incomes).toEqual(mockIncomes);
        expect(data.expenses).toEqual(mockExpenses);
        expect(data.creditCardExpenses).toEqual(mockCreditCardExpenses);
    });

    it('should handle API errors gracefully', async () => {
        axiosInstance.get.mockRejectedValueOnce(new Error('Failed to fetch incomes'));
        const { result } = renderHook(() => useFetchYearData());

        await expect(async () => {
            await act(async () => {
                await result.current(2024);  // Pass the year as 2024
            });
        }).rejects.toThrow('Failed to fetch incomes');

        expect(axiosInstance.get).toHaveBeenCalledWith('incomes/?year=2024&include_recurring=true');
    });
});
