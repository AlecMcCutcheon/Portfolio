import React, { useState, useRef, useEffect } from 'react';
import { generateProceduralImage, stableStringify, ProceduralOptions } from './ProceduralArt';

interface OptimizedImageProps {
  data: unknown | string;
  width?: number;
  height?: number;
  options?: ProceduralOptions;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean; // For above-the-fold images
  sizes?: string; // For responsive images
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  data, 
  width = 800, 
  height = 480, 
  options, 
  alt = 'procedural-art', 
  className, 
  style,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Load immediately if priority
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Check if data is a URL (starts with http or data:)
  const isUrl = typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'));
  const seed = isUrl ? data : (typeof data === 'string' ? data : stableStringify(data));
  
  useEffect(() => {
    if (priority) return; // Skip intersection observer for priority images
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin: '50px' // Start loading 50px before the image comes into view
      }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [priority]);
  
  const generateOptimizedSrc = (targetWidth: number, targetHeight: number) => {
    if (isUrl) {
      return seed; // Return the URL as-is for external images
    }
    return generateProceduralImage(seed, { 
      width: targetWidth, 
      height: targetHeight, 
      ...options 
    });
  };
  
  // Generate different sizes for responsive images
  const generateResponsiveSrcSet = () => {
    if (isUrl) {
      return undefined; // Don't generate srcset for external URLs
    }
    
    const sizes = [
      { width: Math.floor(width * 0.5), height: Math.floor(height * 0.5) },
      { width, height },
      { width: Math.floor(width * 1.5), height: Math.floor(height * 1.5) },
      { width: width * 2, height: height * 2 }
    ];
    
    return sizes
      .map(size => `${generateOptimizedSrc(size.width, size.height)} ${size.width}w`)
      .join(', ');
  };
  
  if (!isInView) {
    // Placeholder while not in view
    return (
      <div 
        ref={imgRef}
        className={`bg-gray-200 dark:bg-gray-700 animate-pulse ${className}`}
        style={{ width, height, ...style }}
        aria-label={alt}
      />
    );
  }
  
  const srcSet = generateResponsiveSrcSet();
  
  return (
    <img
      ref={imgRef}
      src={generateOptimizedSrc(width, height)}
      {...(srcSet && { srcSet, sizes })}
      width={width}
      height={height}
      alt={alt}
      className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setIsLoaded(true)}
    />
  );
};

export default OptimizedImage;
