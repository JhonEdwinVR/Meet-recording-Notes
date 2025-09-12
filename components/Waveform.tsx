import React, { useState, useEffect } from 'react';

const Waveform: React.FC = () => {
  const barCount = 25;
  // Initialize with random heights to avoid an empty state on first render
  const [heights, setHeights] = useState<number[]>(() => 
    Array.from({ length: barCount }, () => Math.random())
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setHeights(Array.from({ length: barCount }, () => Math.random()));
    }, 300); // Update every 300ms for a fluid look

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="flex items-end justify-center w-full max-w-xs h-12 space-x-1" 
      aria-hidden="true"
    >
      {heights.map((height, i) => (
        <div
          key={i}
          className="w-1.5 bg-cyan-400/70 rounded-full transition-all duration-200 ease-in-out"
          style={{ height: `${10 + height * 80}%` }}
        />
      ))}
    </div>
  );
};

export default Waveform;
