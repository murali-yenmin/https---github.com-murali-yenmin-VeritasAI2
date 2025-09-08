"use client";

import { useState, useEffect } from 'react';

export const useCountUp = (end: number, duration: number = 1.5) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (end === 0 && count === 0) return;
    
    let start = 0;
    const startTime = Date.now();

    const animate = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / (duration * 1000), 1);
      
      // easeOutCubic easing function
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      const currentCount = Math.round(end * easedProgress);
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    const animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return count;
};
