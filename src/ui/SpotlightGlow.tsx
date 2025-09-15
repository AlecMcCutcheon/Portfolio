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
  // Detect touch/mobile to disable hover & dynamic glow
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  useEffect(() => {
    const check = () => {
      // NEW CODE - TESTING: Treat as touch-only only when device supports touch AND lacks hover capability
      const hoverCapable = window.matchMedia('(hover: hover)').matches;
      const supportsTouch = ('ontouchstart' in window) || ((navigator as any).maxTouchPoints > 0);
      const touchOnly = supportsTouch && !hoverCapable;
      setIsTouchDevice(touchOnly);
    };
    check();
    const mmHover = window.matchMedia('(hover: hover)');
    mmHover.addEventListener('change', check);
    window.addEventListener('resize', check);
    return () => {
      mmHover.removeEventListener('change', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  // Also disable interactions on small screens (mobile breakpoint)
  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setIsSmallScreen(media.matches);
    update();
    media.addEventListener('change', update);
    window.addEventListener('resize', update);
    return () => {
      media.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  // DISABLED FOR PERFORMANCE: Inner glow disabled (no color sampling)
  const [topColor, setTopColor] = useState('rgba(255,255,255,0)');
  const [rightColor, setRightColor] = useState('rgba(255,255,255,0)');
  const [bottomColor, setBottomColor] = useState('rgba(255,255,255,0)');
  const [leftColor, setLeftColor] = useState('rgba(255,255,255,0)');

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

  // DISABLED FOR PERFORMANCE: Color sampling disabled (inner glow removed)
  const rafRef = useRef<number | null>(null);
  const sampleEdges = useCallback(() => {
    // No-op - color sampling disabled
  }, []);

  const startLoop = useCallback(() => {
    // No-op - color sampling disabled
  }, []);

  const stopLoop = useCallback(() => {
    // No-op - color sampling disabled
  }, []);

  // DISABLED FOR PERFORMANCE: Dynamic inner-glow sampling disabled on all devices
  useEffect(() => {
    // No-op - inner glow sampling disabled for performance
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || isSmallScreen) return;
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
      // Disable hover spotlight on touch/mobile or small screens
      onMouseEnter={() => { if (!(isTouchDevice || isSmallScreen)) setSpotOpacity(0.7); }}
      onMouseLeave={() => { if (!(isTouchDevice || isSmallScreen)) setSpotOpacity(0); }}
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
          opacity: (isTouchDevice || isSmallScreen) ? 0 : spotOpacity,
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


