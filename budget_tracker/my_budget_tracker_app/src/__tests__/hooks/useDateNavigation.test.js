import { renderHook, act } from '@testing-library/react';
import { useDateNavigation } from '../../hooks/useDateNavigation';  // Adjust the path as per your project structure
import { useNavigate } from 'react-router-dom';

// Mock useNavigate from react-router-dom
jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
}));

describe('useDateNavigation', () => {
    let navigate;

    beforeEach(() => {
        navigate = jest.fn();
        useNavigate.mockReturnValue(navigate);  // Mock navigate function
    });

    it('should navigate to the previous month when goToPreviousMonth is called', () => {
        const year = 2024;
        const month = 3;  // March
        
        const { result } = renderHook(() => useDateNavigation(year, month));
        
        act(() => {
            result.current.goToPreviousMonth();
        });

        expect(navigate).toHaveBeenCalledWith('/home?year=2024&month=2');
    });

    it('should navigate to the previous year in December when goToPreviousMonth is called from January', () => {
        const year = 2024;
        const month = 1;  // January

        const { result } = renderHook(() => useDateNavigation(year, month));

        act(() => {
            result.current.goToPreviousMonth();
        });

        expect(navigate).toHaveBeenCalledWith('/home?year=2023&month=12');
    });

    it('should navigate to the next month when goToNextMonth is called', () => {
        const year = 2024;
        const month = 3;  // March

        const { result } = renderHook(() => useDateNavigation(year, month));

        act(() => {
            result.current.goToNextMonth();
        });

        expect(navigate).toHaveBeenCalledWith('/home?year=2024&month=4');
    });

    it('should navigate to the next year in January when goToNextMonth is called from December', () => {
        const year = 2024;
        const month = 12;  // December

        const { result } = renderHook(() => useDateNavigation(year, month));

        act(() => {
            result.current.goToNextMonth();
        });

        expect(navigate).toHaveBeenCalledWith('/home?year=2025&month=1');
    });
});
