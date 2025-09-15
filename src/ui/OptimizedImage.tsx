import React, { useState, useRef } from 'react';
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
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Check if data is a URL (starts with http or data:)
  const isUrl = typeof data === 'string' && (data.startsWith('http') || data.startsWith('data:'));
  const seed = isUrl ? data : (typeof data === 'string' ? data : stableStringify(data));
  
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
  
  const srcSet = generateResponsiveSrcSet();
  
  return (
    <img
      ref={imgRef}
      src={generateOptimizedSrc(width, height)}
      {...(srcSet && { srcSet, sizes })}
      width={width}
      height={height}
      alt={alt}
      className={`w-full h-full transition-transform duration-300 hover:scale-110 object-cover ${className}`}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setIsLoaded(true)}
    />
  );
};

export default OptimizedImage;
