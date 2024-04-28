import { useNavigate } from 'react-router-dom';

export function useDateNavigation() {
  const navigate = useNavigate();

  const goToPreviousMonth = (year, month) => {
    const newYear = month === 1 ? year - 1 : year;
    const newMonth = month === 1 ? 12 : month - 1;
    navigate(`/home?year=${newYear}&month=${newMonth}`);
  };

  const goToNextMonth = (year, month) => {
    const newYear = month === 12 ? year + 1 : year;
    const newMonth = month === 12 ? 1 : month + 1;
    navigate(`/home?year=${newYear}&month=${newMonth}`);
  };

  return { goToPreviousMonth, goToNextMonth };
}
