'use client';

import { useEffect, useState } from 'react';

type UseCharacterBlinkOptions = {
  minInterval?: number;
  maxInterval?: number;
  duration?: number;
  delay?: number;
};

export function useCharacterBlink({
  minInterval = 2800,
  maxInterval = 5800,
  duration = 140,
  delay = 0,
}: UseCharacterBlinkOptions = {}) {
  const [blinking, setBlinking] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const range = maxInterval - minInterval;
      const next = minInterval + Math.random() * range + delay;
      timer = setTimeout(() => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), duration);
        schedule();
      }, next);
    };
    schedule();
    return () => clearTimeout(timer);
  }, [minInterval, maxInterval, duration, delay]);

  return blinking;
}
