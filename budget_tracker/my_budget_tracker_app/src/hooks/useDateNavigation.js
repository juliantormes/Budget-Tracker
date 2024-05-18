import { useNavigate } from 'react-router-dom';

export function useDateNavigation(year, month) {
    const navigate = useNavigate();

    const goToPreviousMonth = () => {
        const newDate = new Date(year, month - 1, 1); // JavaScript months are zero-based
        newDate.setMonth(newDate.getMonth() - 1); // Move to the previous month
        const newYear = newDate.getFullYear();
        const newMonth = newDate.getMonth() + 1; // Adjust back to 1-based month
        navigate(`/home?year=${newYear}&month=${newMonth}`);
    };

    const goToNextMonth = () => {
        const newDate = new Date(year, month - 1, 1); // JavaScript months are zero-based
        newDate.setMonth(newDate.getMonth() + 1); // Move to the next month
        const newYear = newDate.getFullYear();
        const newMonth = newDate.getMonth() + 1; // Adjust back to 1-based month
        navigate(`/home?year=${newYear}&month=${newMonth}`);
    };

    return { goToPreviousMonth, goToNextMonth };
}
