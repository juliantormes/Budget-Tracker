import { useNavigate } from 'react-router-dom';

export function useDateNavigation(year, month) {
    const navigate = useNavigate();

    const goToPreviousMonth = () => {
        const newDate = new Date(year, month - 1, 1);
        newDate.setMonth(newDate.getMonth() - 1);
        const newYear = newDate.getFullYear();
        const newMonth = newDate.getMonth() + 1;
        navigate(`/home?year=${newYear}&month=${newMonth}`);
    };

    const goToNextMonth = () => {
        const newDate = new Date(year, month - 1, 1);
        newDate.setMonth(newDate.getMonth() + 1);
        const newYear = newDate.getFullYear();
        const newMonth = newDate.getMonth() + 1;
        navigate(`/home?year=${newYear}&month=${newMonth}`);
    };

    return { goToPreviousMonth, goToNextMonth };
}
