
import { useState, useEffect } from 'react';
import { Machine } from "@/types";

export function useSessionTimer(machine: Machine) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!machine.expected_end_time || machine.status !== 'in-use') {
      setTimeRemaining(null);
      setIsActive(false);
      return;
    }

    const endTime = new Date(machine.expected_end_time).getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const remaining = endTime - now;

      if (remaining <= 0) {
        setTimeRemaining(0);
        setIsActive(false);
      } else {
        setTimeRemaining(remaining);
        setIsActive(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [machine.expected_end_time, machine.status]);

  const formatTimeRemaining = () => {
    if (!timeRemaining) return '';
    
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    timeRemaining,
    isActive,
    formattedTime: formatTimeRemaining()
  };
}
