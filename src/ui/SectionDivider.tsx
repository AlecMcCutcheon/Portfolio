import React from 'react';
import { cn } from '../lib/utils';

interface SectionDividerProps {
  className?: string;
  widthClassName?: string;
}

const SectionDivider: React.FC<SectionDividerProps> = ({ className, widthClassName }) => {
  return (
    <div className={cn('mx-auto w-full max-w-6xl py-4 sm:py-6 px-4 pointer-events-none', className)}>
      <div className={cn('relative mx-auto w-[60%] max-w-3xl', widthClassName)}>
        {/* Base line (darker on light; subtle on dark) */}
        <div className="h-[2px] sm:h-px w-full rounded-full bg-neutral-500 dark:bg-white/20" />
        {/* Gradient highlight overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-neutral-700/70 dark:via-white/30 to-transparent opacity-90 sm:opacity-70" aria-hidden />
        {/* Subtle ring to match glass theme */}
        <div className="absolute inset-0 rounded-full ring-1 ring-neutral-600/60 dark:ring-white/15 opacity-60" aria-hidden />
      </div>
    </div>
  );
};

export default SectionDivider;


