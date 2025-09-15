import { useState, useEffect } from 'react';

/**
 * Hook to detect mobile devices and screen size
 * Returns information about device type and screen dimensions
 */
export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);
  const [isLowPowerMode, setIsLowPowerMode] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setScreenWidth(width);

      // Check for mobile devices
      const mobile = width < 768; // Tailwind's md breakpoint
      setIsMobile(mobile);

      // Check for tablets
      const tablet = width >= 768 && width < 1024;
      setIsTablet(tablet);

      // Check for low power mode (iOS) or reduced motion preferences
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isLowPowerDevice = width < 480 || (navigator as any).deviceMemory < 4 || prefersReducedMotion;
      setIsLowPowerMode(isLowPowerDevice);
    };

    // Initial check
    checkDevice();

    // Listen for resize events
    window.addEventListener('resize', checkDevice);

    // Listen for reduced motion preference changes
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => checkDevice();
    motionMediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', checkDevice);
      motionMediaQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop: !isMobile && !isTablet,
    screenWidth,
    isLowPowerMode,
    shouldDisableAnimations: isMobile || isLowPowerMode,
    shouldReduceEffects: isMobile || isTablet || isLowPowerMode,
  };
};
