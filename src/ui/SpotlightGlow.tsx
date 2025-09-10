import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { BackgroundColorContext } from './background-gradient-animation';

interface SpotlightGlowProps {
  children: React.ReactNode;
  className?: string;
  edgeThickness?: number; // px
  insetSample?: number; // px
  outerRef?: React.Ref<HTMLDivElement>; // optional external ref to root
}

const SpotlightGlow: React.FC<SpotlightGlowProps> = ({ children, className = '', edgeThickness = 4, insetSample = 8, outerRef }) => {
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const bgColorCtx = useContext(BackgroundColorContext);
  // per-edge colors
  const [topColor, setTopColor] = useState('rgba(255,255,255,0.18)');
  const [rightColor, setRightColor] = useState('rgba(255,255,255,0.18)');
  const [bottomColor, setBottomColor] = useState('rgba(255,255,255,0.18)');
  const [leftColor, setLeftColor] = useState('rgba(255,255,255,0.18)');

  // white spotlight
  const [spotX, setSpotX] = useState(0);
  const [spotY, setSpotY] = useState(0);
  const [spotOpacity, setSpotOpacity] = useState(0);

  // Track theme to adjust brightness
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {
    const check = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const readColorAt = useCallback((x: number, y: number): string | null => {
    if (bgColorCtx && typeof (bgColorCtx as any).getBackgroundColorAt === 'function') {
      return (bgColorCtx as any).getBackgroundColorAt(x, y) as string;
    }
    if (typeof (window as any).__getBackgroundColorAt === 'function') {
      return (window as any).__getBackgroundColorAt(x, y) as string;
    }
    return null;
  }, [bgColorCtx]);

  const parseToRgba = (str: string | null, alpha = 0.22): string | null => {
    if (!str) return null;
    const m = str.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!m) return null;
    const r = parseInt(m[1], 10);
    const g = parseInt(m[2], 10);
    const b = parseInt(m[3], 10);
    return `rgba(${r},${g},${b},${alpha})`;
  };

  // Continuously sample per-edge colors
  const rafRef = useRef<number | null>(null);
  const sampleEdges = useCallback(() => {
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    const s = insetSample;
    const top = readColorAt(rect.left + rect.width / 2, rect.top + s);
    const right = readColorAt(rect.right - s, rect.top + rect.height / 2);
    const bottom = readColorAt(rect.left + rect.width / 2, rect.bottom - s);
    const left = readColorAt(rect.left + s, rect.top + rect.height / 2);
    const edgeAlpha = isDarkMode ? 0.24 : 0.16; // brighter on dark, darker on light
    const t = parseToRgba(top, edgeAlpha); if (t) setTopColor(t);
    const r = parseToRgba(right, edgeAlpha); if (r) setRightColor(r);
    const b = parseToRgba(bottom, edgeAlpha); if (b) setBottomColor(b);
    const l = parseToRgba(left, edgeAlpha); if (l) setLeftColor(l);
  }, [readColorAt, insetSample, isDarkMode, containerEl]);

  const startLoop = useCallback(() => {
    if (rafRef.current) return;
    const loop = () => {
      sampleEdges();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [sampleEdges]);

  const stopLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  useEffect(() => {
    startLoop();
    return () => stopLoop();
  }, [startLoop, stopLoop]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerEl) return;
    const rect = containerEl.getBoundingClientRect();
    setSpotX(e.clientX - rect.left);
    setSpotY(e.clientY - rect.top);
  };

  return (
    <div
      ref={(el) => {
        setContainerEl(el);
        if (typeof outerRef === 'function') outerRef(el);
        else if (outerRef && 'current' in (outerRef as any)) (outerRef as any).current = el;
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setSpotOpacity(0.7)}
      onMouseLeave={() => setSpotOpacity(0)}
      className={`relative overflow-hidden pointer-events-auto ${className}`}
    >
      {/* per-side inner glow overlays */}
      <div className="pointer-events-none absolute left-0 right-0 top-0" style={{ height: edgeThickness, background: `linear-gradient(to bottom, ${topColor}, transparent)` }} />
      <div className="pointer-events-none absolute top-0 bottom-0 right-0" style={{ width: edgeThickness, background: `linear-gradient(to left, ${rightColor}, transparent)` }} />
      <div className="pointer-events-none absolute left-0 right-0 bottom-0" style={{ height: edgeThickness, background: `linear-gradient(to top, ${bottomColor}, transparent)` }} />
      <div className="pointer-events-none absolute top-0 bottom-0 left-0" style={{ width: edgeThickness, background: `linear-gradient(to right, ${leftColor}, transparent)` }} />
      {/* white hover spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-150 ease-out"
        style={{
          opacity: spotOpacity,
          mixBlendMode: 'normal',
          // NEW: use white in dark mode, stronger neutral gray in light mode
          background: `radial-gradient(280px 280px at ${spotX}px ${spotY}px, ${isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(107,114,128,0.22)'}, transparent 72%)`,
          filter: 'blur(10px)'
        }}
      />
      {children}
    </div>
  );
};

export default SpotlightGlow;


