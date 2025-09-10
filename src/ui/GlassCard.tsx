import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../lib/utils';
import { BackgroundColorContext } from './background-gradient-animation';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  /** Enables a soft highlight following the cursor */
  hoverSpotlight?: boolean;
  /** Frost blur amount in pixels (medium default) */
  blur?: number;
  /** Backdrop saturation factor (1 = none, 1.15 = subtle pop) */
  saturation?: number;
  /** Base glass background opacity (0-1) */
  backgroundOpacity?: number;
  /** Spotlight radius in pixels */
  spotlightRadiusPx?: number;
  /** Spotlight color alpha (0-1) */
  spotlightIntensity?: number;
}

/**
 * A reusable frosted glass card with subtle gradient border, noise, and optional hover spotlight.
 * If the background sampler is available, it will tint the border to the sampled color.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  hoverSpotlight = true,
  blur = 10,
  saturation = 1.15,
  backgroundOpacity = 0.35,
  spotlightRadiusPx = 520,
  spotlightIntensity = 0.12,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const sampler = React.useContext(BackgroundColorContext);
  const [tint, setTint] = useState<string>('37, 99, 235');
  const [spot, setSpot] = useState({ xPct: 50, yPct: 50 });
  const [spotRgb, setSpotRgb] = useState<string>('37, 99, 235');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Track dark mode to pick base glass fill color
  useEffect(() => {
    const check = () => setIsDarkMode(document.documentElement.classList.contains('dark'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Sample background color at card center for border tinting
  useEffect(() => {
    function updateTint() {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      if (sampler?.getBackgroundColorAt) {
        const rgb = sampler.getBackgroundColorAt(cx, cy);
        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) setTint(`${match[1]}, ${match[2]}, ${match[3]}`);
      }
    }
    updateTint();
    window.addEventListener('resize', updateTint);
    const id = setInterval(updateTint, 1000);
    return () => {
      window.removeEventListener('resize', updateTint);
      clearInterval(id);
    };
  }, [sampler]);

  // Track cursor for spotlight and sample live color from background animation
  useEffect(() => {
    if (!hoverSpotlight) return;
    function onMove(e: MouseEvent) {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setSpot({ xPct: Math.max(0, Math.min(100, x)), yPct: Math.max(0, Math.min(100, y)) });
      if (sampler?.getBackgroundColorAt) {
        const rgb = sampler.getBackgroundColorAt(e.clientX, e.clientY);
        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) setSpotRgb(`${match[1]}, ${match[2]}, ${match[3]}`);
      } else {
        setSpotRgb(tint);
      }
    }
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [hoverSpotlight, sampler, tint]);

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative group pointer-events-auto',
        // Gradient border wrapper
        'rounded-2xl p-[1px]',
        'bg-[linear-gradient(135deg,rgba(var(--tint,37,99,235),0.55),rgba(255,255,255,0.14))]',
        className
      )}
      style={{
        // Provide CSS var for dynamic tint
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        '--tint': tint,
      } as React.CSSProperties}
    >
      {/* Core glass surface */}
      {/* # OLD CODE - KEEP UNTIL CONFIRMED WORKING
      <div
        className={cn(
          'relative rounded-2xl',
          'bg-white/45 dark:bg-dark-800/45',
          'backdrop-blur-md',
          'border border-white/30 dark:border-dark-700/40',
          'shadow-lg transition-all duration-300',
          'hover:shadow-xl'
        )}
      >
      */}
      {/* # NEW CODE - TESTING */}
      <div
        className={cn(
          'relative rounded-2xl',
          'border border-white/30 dark:border-dark-700/40',
          'shadow-lg transition-all duration-300 hover:shadow-xl'
        )}
        style={{
          backdropFilter: `saturate(${saturation}) blur(${blur}px)`,
          WebkitBackdropFilter: `saturate(${saturation}) blur(${blur}px)`,
          backgroundColor: isDarkMode
            ? `rgba(30, 41, 59, ${backgroundOpacity})`
            : `rgba(255, 255, 255, ${backgroundOpacity})`,
        }}
      >
        {/* Optional hover spotlight */}
        {hoverSpotlight && (
          <div
            className={cn(
              'pointer-events-none absolute inset-0 rounded-2xl opacity-0',
              'group-hover:opacity-100 transition-opacity duration-300'
            )}
            style={{
              background: `radial-gradient(${spotlightRadiusPx}px circle at ${spot.xPct}% ${spot.yPct}%, rgba(${spotRgb}, ${spotlightIntensity}), transparent 40%)`,
              mixBlendMode: 'soft-light',
            }}
          />
        )}

        {/* Fine noise for texture */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-30"
          style={{
            backgroundImage:
              'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'>\n  <filter id=\'n\'>\n    <feTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/>\n    <feColorMatrix type=\'saturate\' values=\'0\'/>\n  </filter>\n  <rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.25\'/>\n</svg>")',
            backgroundSize: '200px 200px',
            borderRadius: '1rem',
          }}
        />

        {/* Content */}
        <div className="relative rounded-2xl">
          {children}
        </div>
      </div>
    </div>
  );
};

export default GlassCard;



