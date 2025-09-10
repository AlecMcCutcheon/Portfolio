import { useEffect, useState } from 'react';

export function useBackgroundColorsAtPoints(points: {x: number, y: number}[], interval = 60) {
  const [colors, setColors] = useState<string[]>(() => points.map(() => 'rgb(255,255,255)'));
  useEffect(() => {
    const getColor = (window as any).__getBackgroundColorAt;
    if (!getColor) return;
    const timer = setInterval(() => {
      setColors(points.map(pt => getColor(pt.x, pt.y)));
    }, interval);
    return () => clearInterval(timer);
  }, [points, interval]);
  return colors;
} 