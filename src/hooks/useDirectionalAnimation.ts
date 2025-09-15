import { useScrollDirection } from '../contexts/ScrollDirectionContext';
import { useState, useEffect } from 'react';

/**
 * Hook that provides directional animation variants based on current scroll direction
 * This hook uses the global scroll direction context to determine animation direction
 */
export const useDirectionalAnimation = () => {
  const { scrollDirection } = useScrollDirection();
  const [animationKey, setAnimationKey] = useState(0);

  // Force animation re-trigger when scroll direction changes
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [scrollDirection]);

  // Create directional animation variants using whileInView approach
  const getDirectionalVariants = (baseDuration: number = 0.4, baseDelay: number = 0) => {
    const isScrollingUp = scrollDirection === 'up';
    
    console.log('Creating directional variants for scroll direction:', scrollDirection, 'isScrollingUp:', isScrollingUp, 'y value:', isScrollingUp ? 30 : -30);
    
    return {
      initial: { 
        opacity: 0, 
        y: isScrollingUp ? 30 : -30 
      },
      whileInView: { 
        opacity: 1, 
        y: 0 
      },
      viewport: { once: true },
      transition: { 
        duration: baseDuration, 
        delay: baseDelay 
      }
    };
  };

  // Create staggered directional variants for multiple elements
  const getStaggeredDirectionalVariants = (
    baseDuration: number = 0.3, 
    baseDelay: number = 0, 
    staggerDelay: number = 0.05
  ) => {
    const isScrollingUp = scrollDirection === 'up';
    
    return (index: number) => ({
      initial: { 
        opacity: 0, 
        y: isScrollingUp ? 30 : -30 
      },
      whileInView: { 
        opacity: 1, 
        y: 0 
      },
      viewport: { once: true },
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
