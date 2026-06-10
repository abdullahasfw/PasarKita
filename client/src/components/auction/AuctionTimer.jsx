import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export function AuctionTimer({ endTime, onEnd, className = '' }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const end = new Date(endTime).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = end - now;

      if (difference <= 0) {
        setIsEnded(true);
        setTimeLeft('Lelang Berakhir');
        if (onEnd) onEnd();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      let timeString = '';
      if (days > 0) timeString += `${days}h `;
      timeString += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      setTimeLeft(timeString);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime, onEnd]);

  return (
    <div className={`flex items-center space-x-1.5 ${isEnded ? 'text-red-500 font-semibold' : 'text-orange-500 font-medium'} ${className}`}>
      <Clock className="w-4 h-4" />
      <span>{timeLeft}</span>
    </div>
  );
}
