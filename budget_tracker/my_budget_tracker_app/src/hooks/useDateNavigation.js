import { useNavigate } from 'react-router-dom';

export function useDateNavigation(year, month) {
    const navigate = useNavigate();

    const goToPreviousMonth = () => {
        const newDate = new Date(year, month - 2, 1);
        navigate(`/home?year=${newDate.getFullYear()}&month=${newDate.getMonth() + 1}`);
    };

    const goToNextMonth = () => {
        const newDate = new Date(year, month, 1);
        navigate(`/home?year=${newDate.getFullYear()}&month=${newDate.getMonth() + 1}`);
    };

    return { goToPreviousMonth, goToNextMonth };
}
