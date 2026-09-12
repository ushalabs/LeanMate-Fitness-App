import { useEffect, useState } from 'react';
import { formatLocalDate } from '../utils/date';

export const useTodayDate = () => {
  const [today, setToday] = useState(() => formatLocalDate(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setToday(formatLocalDate(new Date()));
    }, 60_000);

    return () => clearInterval(interval);
  }, []);

  return today;
};
