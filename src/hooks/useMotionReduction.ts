import { useMobileDetection } from './useMobileDetection';

/**
 * Hook to provide motion reduction settings for Framer Motion
 * Returns animation props that can be used to disable or reduce animations
 */
export const useMotionReduction = () => {
  const { shouldDisableAnimations, shouldReduceEffects } = useMobileDetection();

  // Animation variants for different levels of reduction
  const getAnimationProps = () => {
    if (shouldDisableAnimations) {
      return {
        initial: false,
        animate: false,
        exit: false,
        transition: { duration: 0 },
        whileHover: {},
        whileTap: {},
        whileInView: {},
      };
    }

    if (shouldReduceEffects) {
      return {
        transition: { duration: 0.2, ease: "easeOut" },
        whileHover: {},
        whileTap: { scale: 0.98 },
        whileInView: { opacity: 1, y: 0 },
      };
    }

    // Default animations for desktop
    return {};
  };

  // Reduced motion variants for common animations
  const fadeInUp = {
    hidden: shouldDisableAnimations ? false : { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
    transition: shouldDisableAnimations ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }
  };

  const slideInFromLeft = {
    hidden: shouldDisableAnimations ? false : { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
    transition: shouldDisableAnimations ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }
  };

  const scaleIn = {
    hidden: shouldDisableAnimations ? false : { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    transition: shouldDisableAnimations ? { duration: 0 } : { duration: 0.3, ease: "easeOut" }
  };

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: shouldDisableAnimations 
        ? { duration: 0 }
        : {
            staggerChildren: 0.1,
            delayChildren: 0.1
          }
    }
  };

  return {
    shouldDisableAnimations,
    shouldReduceEffects,
    getAnimationProps,
    variants: {
      fadeInUp,
      slideInFromLeft,
      scaleIn,
      staggerContainer,
    }
  };
};
