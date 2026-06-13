import React, { useEffect, useState } from 'react';

interface SoundWaveformProps {
  isActive: boolean;
  color?: string;
  count?: number;
  speedMs?: number;
}

export default function SoundWaveform({
  isActive,
  color = '#5C8A6B',
  count = 32,
  speedMs = 80
}: SoundWaveformProps) {
  const [heights, setHeights] = useState<number[]>([]);

  useEffect(() => {
    const initial = Array.from({ length: count }, (_, i) => 20 + Math.sin(i * 0.5) * 15);
    setHeights(initial);
  }, [count]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setHeights(prev =>
        prev.map((h, i) => {
          const rand = Math.random();
          if (rand > 0.65) {
            return Math.random() * 85 + 15;
          }
          return Math.max(8, Math.min(100, h * (0.75 + Math.random() * 0.5)));
        })
      );
    }, speedMs);

    return () => clearInterval(interval);
  }, [isActive, count, speedMs]);

  return (
    <div className="flex items-center justify-center gap-[2px] h-20 w-full px-3 overflow-hidden">
      {heights.map((h, i) => {
        const displayHeight = isActive ? h : 12 + Math.sin(i * 0.5) * 5;
        return (
          <div
            key={i}
            className="rounded-full transition-all"
            style={{
              width: '3px',
              height: `${displayHeight}%`,
              backgroundColor: color,
              opacity: isActive ? 0.85 : 0.3,
              transitionDuration: `${speedMs * 0.8}ms`,
              transitionTimingFunction: 'ease-out'
            }}
          />
        );
      })}
    </div>
  );
}
