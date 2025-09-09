"use client";
import { useState, useEffect, useRef } from 'react';

export const useTypewriter = (text: string, speed: number = 50, onFinished?: () => void) => {
  const [displayedText, setDisplayedText] = useState('');
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  useEffect(() => {
    if (!text) {
      if (onFinishedRef.current) {
        onFinishedRef.current();
      }
      return;
    };
    
    setDisplayedText('');
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(intervalId);
        if (onFinishedRef.current) {
          onFinishedRef.current();
        }
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  const isFinished = displayedText.length === text?.length;

  return { displayText, isFinished };
};
