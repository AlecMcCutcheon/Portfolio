import { useMobileDetection } from './useMobileDetection';

/**
 * Hook that provides performance-optimized animation variants
 * Automatically reduces animations on mobile and low-power devices
 */
export const usePerformanceOptimizedAnimation = () => {
  const { shouldDisableAnimations } = useMobileDetection();

  // Performance-optimized variants with reduced complexity
  const getOptimizedVariants = (baseDuration: number = 0.4, baseDelay: number = 0) => {
    if (shouldDisableAnimations) {
      return {
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0 },
        transition: { duration: 0.01 }
      };
    }

    return {
      hidden: { 
        opacity: 0, 
        y: 20 // Reduced from 30 to 20 for smoother animation
      },
      visible: { 
        opacity: 1, 
        y: 0 
      },
      transition: { 
        duration: baseDuration * 0.8, // Slightly faster animations
        delay: baseDelay,
        ease: [0.25, 0.46, 0.45, 0.94] // Custom easing for smoother feel
      }
    };
  };

  const getStaggeredOptimizedVariants = (
    baseDuration: number = 0.3, 
    baseDelay: number = 0, 
    staggerDelay: number = 0.03 // Reduced stagger delay
  ) => {
    if (shouldDisableAnimations) {
      return (index: number) => ({
        hidden: { opacity: 1, y: 0 },
        visible: { opacity: 1, y: 0 },
        transition: { duration: 0.01 }
      });
    }

    return (index: number) => ({
      hidden: { 
        opacity: 0, 
        y: 15 // Reduced from 30 to 15
      },
      visible: { 
        opacity: 1, 
        y: 0 
      },
      transition: { 
        duration: baseDuration * 0.7, // Faster animations
        delay: baseDelay + (index * staggerDelay),
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    });
  };

  // Optimized whileInView variants for scroll-triggered animations
  const getOptimizedWhileInView = (isScrollingUp: boolean = false) => {
    if (shouldDisableAnimations) {
      return {
        initial: { opacity: 1, y: 0 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.01 }
      };
    }

    return {
      initial: { 
        opacity: 0, 
        y: isScrollingUp ? 20 : -20 // Reduced movement distance
      },
      whileInView: { 
        opacity: 1, 
        y: 0 
      },
      viewport: { once: true, margin: "0px 0px -100px 0px" }, // Start animation earlier
      transition: { 
        duration: 0.3, // Faster transition
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    };
  };

  return {
    shouldDisableAnimations,
    getOptimizedVariants,
    getStaggeredOptimizedVariants,
    getOptimizedWhileInView
  };
};
