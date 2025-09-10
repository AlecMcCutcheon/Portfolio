import React, { useEffect, useRef, useState } from 'react';

const GlassDebugSample: React.FC = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [color, setColor] = useState('rgb(255,255,255)');
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Disabled: do not track mouse when component is not in use
    return () => {};
  }, []);

  useEffect(() => {
    // Disabled sampling loop
    return () => {};
  }, []);

  return null;
};

export default GlassDebugSample; 