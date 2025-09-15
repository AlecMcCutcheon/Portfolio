import { useState, useEffect } from 'react';

/**
 * Hook to detect scroll direction and provide directional animation variants
 * Returns animation variants that fade in from the direction the user is scrolling from
 */
export const useScrollDirection = () => {
  const [scrollDirection, setScrollDirection] = useState<'down' | 'up' | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      
      if (scrollY > lastScrollY && scrollY > 100) {
        setScrollDirection('down');
      } else if (scrollY < lastScrollY) {
        setScrollDirection('up');
      }
      
      setLastScrollY(scrollY);
    };

    window.addEventListener('scroll', updateScrollDirection);
    return () => window.removeEventListener('scroll', updateScrollDirection);
  }, [lastScrollY]);

  // Create directional animation variants
  const getDirectionalVariants = (baseDuration: number = 0.4, baseDelay: number = 0) => {
    if (scrollDirection === 'up') {
      // Scrolling up - fade in from bottom
      return {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: baseDuration, delay: baseDelay }
      };
    } else {
      // Scrolling down or initial load - fade in from top
      return {
        initial: { opacity: 0, y: -30 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: baseDuration, delay: baseDelay }
      };
    }
  };

  // Create staggered directional variants for multiple elements
  const getStaggeredDirectionalVariants = (
    baseDuration: number = 0.3, 
    baseDelay: number = 0, 
    staggerDelay: number = 0.05
  ) => {
    return (index: number) => ({
      initial: scrollDirection === 'up' 
        ? { opacity: 0, y: 30 }
        : { opacity: 0, y: -30 },
      animate: { opacity: 1, y: 0 },
      transition: { 
        duration: baseDuration, 
        delay: baseDelay + (index * staggerDelay) 
      }
    });
  };

  return {
    scrollDirection,
    getDirectionalVariants,
    getStaggeredDirectionalVariants
  };
};
