import React, { useEffect, useRef, useState } from 'react';

const GlassDebugSample: React.FC = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState('rgb(255,255,255)');
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function handleMove(e: MouseEvent) {
      setMouse({ x: e.clientX, y: e.clientY });
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const getColor = (window as any).__getBackgroundColorAt;
      if (getColor) {
        setColor(getColor(mouseRef.current.x, mouseRef.current.y));
      }
    }, 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        left: mouse.x + 24,
        top: mouse.y + 24,
        zIndex: 99999,
        pointerEvents: 'none',
        background: 'rgba(30,41,59,0.8)',
        color: '#fff',
        borderRadius: 8,
        padding: '8px 12px',
        fontSize: 14,
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        minWidth: 120,
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: 28,
          height: 28,
          borderRadius: 6,
          background: color,
          border: '1px solid #fff',
        }}
      />
      <span>{color}</span>
    </div>
  );
};

export default GlassDebugSample; 