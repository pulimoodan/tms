import { useState, useEffect } from 'react';
import { Clock01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '../ui/button';

const pulseStyle = `
  @keyframes dot-pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7);
    }
    50% {
      opacity: 0.6;
      transform: scale(1.2);
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0);
    }
  }
  .clock-dot {
    animation: dot-pulse 2s infinite;
  }
`;

export function Clock() {
  const [dateTime, setDateTime] = useState<{ date: string; time: string }>({
    date: '',
    time: '',
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Get time in Dammam timezone (Arabia/Riyadh - UTC+3)
      const dammamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));

      // Format date: "Wed, Dec 24, 2025"
      const dateStr = dammamTime.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      // Format time: "01:32:35 PM"
      const timeStr = dammamTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      setDateTime({ date: dateStr, time: timeStr });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <style>{pulseStyle}</style>
      <Button className="flex items-center gap-2 h-10" variant="secondary">
        <div className="relative">
          <HugeiconsIcon icon={Clock01Icon} className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div className="absolute -top-0 -left-0 h-2 w-2 bg-green-600 dark:bg-green-400 rounded-full clock-dot" />
        </div>
        <div className="flex flex-col items-start justify-center gap-1">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-200 leading-none">
            {dateTime.date} (Dammam)
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 font-mono font-semibold leading-none">
            {dateTime.time}
          </div>
        </div>
      </Button>
    </>
  );
}
