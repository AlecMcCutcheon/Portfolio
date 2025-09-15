"use client";
import { useEffect, useRef, useState, createContext } from "react";
import { cn } from "../lib/utils";
import { useMobileDetection } from "../hooks/useMobileDetection";

// Context for background color sampling
export const BackgroundColorContext = createContext<{ getBackgroundColorAt: (x: number, y: number) => string } | undefined>(undefined);

export const BackgroundGradientAnimation = ({
  gradientBackgroundStart = "rgb(108, 0, 162)",
  gradientBackgroundEnd = "rgb(0, 17, 82)",
  firstColor = "18, 113, 255",
  secondColor = "221, 74, 255",
  thirdColor = "100, 220, 255",
  fourthColor = "200, 50, 50",
  fifthColor = "180, 180, 50",
  pointerColor = "140, 100, 255",
  size = "80%",
  blendingValue = "hard-light",
  children,
  className,
  interactive = true,
  containerClassName,
}: {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  blendingValue?: string;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  containerClassName?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { shouldDisableAnimations, shouldReduceEffects } = useMobileDetection();
  const containerRectRef = useRef<DOMRect | null>(null);
  // Update rect on mount and resize
  useEffect(() => {
    function updateRect() {
      if (containerRef.current) {
        containerRectRef.current = containerRef.current.getBoundingClientRect();
      }
    }
    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, []);
  const [curX, setCurX] = useState(0);
  const [curY, setCurY] = useState(0);
  const [tgX, setTgX] = useState(0);
  const [tgY, setTgY] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [dynamicPointerColor, setDynamicPointerColor] = useState(pointerColor);
  const [targetPointerColor, setTargetPointerColor] = useState(pointerColor);
  const animationFrameRef = useRef<number | null>(null);

  // Multiple animated blobs for the mouse gradient
  const [isTouch, setIsTouch] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  useEffect(() => {
    const detect = () => {
      // Consider as touch-only when device supports touch but does NOT support hover
      const hoverCapable = window.matchMedia('(hover: hover)').matches;
      const supportsTouch = ('ontouchstart' in window) || ((navigator as any).maxTouchPoints > 0);
      const touchOnly = supportsTouch && !hoverCapable;
      setIsTouch(touchOnly);
    };
    detect();
    const mmHover = window.matchMedia('(hover: hover)');
    mmHover.addEventListener('change', detect);
    window.addEventListener('resize', detect);
    return () => {
      mmHover.removeEventListener('change', detect);
      window.removeEventListener('resize', detect);
    };
  }, []);

  // Track mobile breakpoint as small screen as well
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

  const BLOB_RADIUS_MIN = 24; // px (smaller)
  const BLOB_RADIUS_MAX = 56; // px (smaller)
  const BLOB_COUNT = (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) || isSmallScreen || isTouch ? 8 : 14;
  const [blobs, setBlobs] = useState(() => 
    Array.from({ length: BLOB_COUNT }, (_, i) => ({
      id: i,
      angle: Math.random() * Math.PI * 2,
      radius: BLOB_RADIUS_MIN + Math.random() * (BLOB_RADIUS_MAX - BLOB_RADIUS_MIN),
      targetAngle: Math.random() * Math.PI * 2,
      targetRadius: BLOB_RADIUS_MIN + Math.random() * (BLOB_RADIUS_MAX - BLOB_RADIUS_MIN),
      currentColor: pointerColor, // Each blob's own color
      color: pointerColor, // For backward compatibility
      size: 0.06, // slightly larger for more coverage
      speed: 0.01 + Math.random() * 0.01, // Slower
      colorLerp: 0.02 + Math.random() * 0.02, // Each blob gets a lerp factor between 0.02 and 0.04
    }))
  );

  // Swarm center inertia state
  const [swarm, setSwarm] = useState({
    x: 0,
    y: 0,
  });

  // Use refs to always access latest blobs and swarm
  const blobsRef = useRef(blobs);
  const swarmRef = useRef(swarm);
  useEffect(() => { blobsRef.current = blobs; }, [blobs]);
  useEffect(() => { swarmRef.current = swarm; }, [swarm]);

  // Function to calculate color distance (RGB Euclidean distance)
  const colorDistance = (color1: string, color2: string): number => {
    const rgb1 = color1.split(',').map(c => parseInt(c.trim()));
    const rgb2 = color2.split(',').map(c => parseInt(c.trim()));
    return Math.sqrt(
      Math.pow(rgb1[0] - rgb2[0], 2) + 
      Math.pow(rgb1[1] - rgb2[1], 2) + 
      Math.pow(rgb1[2] - rgb2[2], 2)
    );
  };

  // Function to blend colors based on RGB values
  const blendColors = (color1: string, color2: string, weight: number): string => {
    const rgb1 = color1.split(',').map(c => parseInt(c.trim()));
    const rgb2 = color2.split(',').map(c => parseInt(c.trim()));
    
    const blended = rgb1.map((c1, i) => 
      Math.round(c1 * (1 - weight) + rgb2[i] * weight)
    );
    
    return blended.join(', ');
  };

  // Function to get smooth contrasting color based on mouse position
  const selectContrastingColor = (mouseX: number, mouseY: number) => {
    const colors = isDarkMode ? [
      "37, 99, 235",   // first
      "126, 34, 206",  // second
      "6, 182, 212",   // third
      "190, 24, 93",   // fourth
      "21, 128, 61"    // fifth
    ] : [
      firstColor,
      secondColor,
      thirdColor,
      fourthColor,
      fifthColor
    ];

    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;
    
    // Normalize mouse position to 0-1 range
    const normalizedX = mouseX / containerWidth;
    const normalizedY = mouseY / containerHeight;
    
    // Define gradient regions with their positions and colors
    const regions = [
      { x: 0.2, y: 0.1, color: colors[0] },      // Top-left
      { x: 0.8, y: 0.1, color: colors[1] },      // Top-right
      { x: 0.5, y: 0.5, color: colors[2] },      // Center
      { x: 0.2, y: 0.8, color: colors[3] },      // Bottom-left
      { x: 0.8, y: 0.8, color: colors[4] },      // Bottom-right
    ];

    // Find the closest region to determine the base contrasting color
    let closestRegion = regions[0];
    let minDistance = Infinity;
    
    regions.forEach(region => {
      const distance = Math.sqrt(
        Math.pow(normalizedX - region.x, 2) + 
        Math.pow(normalizedY - region.y, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestRegion = region;
      }
    });

    // Find the most contrasting color to the closest region
    let mostContrastingColor = colors[0];
    let maxContrast = 0;

    colors.forEach(color => {
      const contrast = colorDistance(closestRegion.color, color);
      if (contrast > maxContrast) {
        maxContrast = contrast;
        mostContrastingColor = color;
      }
    });

    // Calculate smooth transition based on distance from closest region
    // Use a much larger influence radius for smoother, longer transitions
    const influenceRadius = 8.0; // 800% of screen size (very large/global reach)
    const distanceFromClosest = Math.sqrt(
      Math.pow(normalizedX - closestRegion.x, 2) + 
      Math.pow(normalizedY - closestRegion.y, 2)
    );
    
    // Create smooth falloff - closer to region = stronger contrasting effect
    const influenceStrength = Math.max(0, 1 - (distanceFromClosest / influenceRadius));
    
    // Use a softer curve for the transition
    const smoothInfluence = Math.pow(influenceStrength, 1.1);
    
    // Blend between neutral color and contrasting color based on influence
    const neutralColor = isDarkMode ? "37, 99, 235" : firstColor;
    return blendColors(neutralColor, mostContrastingColor, smoothInfluence * 0.7);
  };

  // For debug: store the last sampled coordinate
  let lastSampledCoord: { x: number; y: number } | null = null;
  // Function to get the background color at a given (x, y) coordinate (in px, relative to window)
  // This is a simplified version: returns the closest region's color (could be improved for gradients)
  const [debugSample, setDebugSample] = useState<{ x: number; y: number } | null>(null);
  const getBackgroundColorAt = (x: number, y: number) => {
    // For debug: store the last sampled coordinate
    lastSampledCoord = { x, y };
    setDebugSample({ x, y });
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return 'rgb(255,255,255)';
    // Clamp x/y to container bounds (same as blob rendering)
    let clampedX = x;
    let clampedY = y;
    if (clampedX < rect.left) clampedX = rect.left;
    if (clampedX > rect.right) clampedX = rect.right;
    if (clampedY < rect.top) clampedY = rect.top;
    if (clampedY > rect.bottom) clampedY = rect.bottom;
    const normalizedX = (clampedX - rect.left) / rect.width;
    const normalizedY = (clampedY - rect.top) / rect.height;
    // Linear gradient color (top to bottom)
    const parseRGB = (str: string): [number, number, number] => {
      const match = str.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!match) return [255,255,255];
      return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
    };
    const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
    const lerpColor = (c1: [number, number, number], c2: [number, number, number], t: number): [number, number, number] => [
      Math.round(lerp(c1[0], c2[0], t)),
      Math.round(lerp(c1[1], c2[1], t)),
      Math.round(lerp(c1[2], c2[2], t)),
    ];
    const gradStart = parseRGB(isDarkMode ? "rgb(15, 23, 42)" : gradientBackgroundStart);
    const gradEnd = parseRGB(isDarkMode ? "rgb(2, 6, 23)" : gradientBackgroundEnd);
    const gradColor = lerpColor(gradStart, gradEnd, normalizedY);
    // Use animated background blobs from window.__backgroundBlobs if available
    const animatedBlobs = (window as any).__backgroundBlobs as Array<{ x: number; y: number; radius: number; color: string }>;
    let totalWeight = 0;
    let blended = [0, 0, 0];
    const container = containerRef.current;
    if (!container) return `rgb(${gradColor[0]},${gradColor[1]},${gradColor[2]})`;
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    const sampleX = normalizedX * width;
    const sampleY = normalizedY * height;
    // Debug: log animated blob positions and sample info
    if (animatedBlobs && Array.isArray(animatedBlobs)) {
      // sampling active
    }
    if (animatedBlobs && Array.isArray(animatedBlobs) && animatedBlobs.length > 0) {
      // only inner 50% of radius contributes
      let sum = [0, 0, 0];
      let totalWeight = 0;
      animatedBlobs.forEach((blob: any, i: number) => {
        // Apply a larger offset to the effective radius for sampling
        const baseRadius = blob.radius * 0.5; // Only inner half
        const effectiveRadius = Math.max(8, baseRadius - 20); // Subtract 20px, clamp to minimum 8px
        const dist = Math.sqrt(Math.pow(sampleX - blob.x, 2) + Math.pow(sampleY - blob.y, 2));
        if (dist <= effectiveRadius) {
          const t = dist / effectiveRadius;
          const w = 1 - t * t; // smoothstep falloff
          const blobColor = blob.color.startsWith('#')
            ? hexToRgb(blob.color)
            : blob.color.split(',').map(Number) as [number, number, number];
          const blended = [
            gradColor[0] * (1 - w) + blobColor[0] * w,
            gradColor[1] * (1 - w) + blobColor[1] * w,
            gradColor[2] * (1 - w) + blobColor[2] * w,
          ];
          // console.log(`Blob ${i}: dist=${dist.toFixed(1)}, effRadius=${effectiveRadius.toFixed(1)}, t=${t.toFixed(2)}, w=${w.toFixed(2)}, blobColor=[${blobColor}], blended=[${blended.map(x=>x.toFixed(1))}]`);
          sum[0] += blended[0] * w;
          sum[1] += blended[1] * w;
          sum[2] += blended[2] * w;
          totalWeight += w;
        } else {
          // console.log(`Blob ${i}: dist=${dist.toFixed(1)}, effRadius=${effectiveRadius.toFixed(1)} (out of range)`);
        }
      });
      if (totalWeight > 0) {
        const avg = sum.map(c => Math.round(c / totalWeight)) as [number, number, number];
        const colorString = `rgb(${avg[0]},${avg[1]},${avg[2]})`;
        // console.log(`getBackgroundColorAt: result at (${sampleX.toFixed(1)}, ${sampleY.toFixed(1)}): ${colorString} (CSS-matched blend)`);
        return colorString;
      }
      // fallback to background color if not enough blob influence
      const bgColorString = `rgb(${gradColor[0]},${gradColor[1]},${gradColor[2]})`;
      // console.log(`getBackgroundColorAt: result at (${sampleX.toFixed(1)}, ${sampleY.toFixed(1)}): ${bgColorString} (background)`);
      return bgColorString;
    }
    // Fallback to gradient color
    return `rgb(${gradColor[0]},${gradColor[1]},${gradColor[2]})`;
    // Helper to convert hex color to rgb array
    function hexToRgb(hex: string): [number, number, number] {
      const h = hex.replace('#', '');
      return [
        parseInt(h.substring(0, 2), 16),
        parseInt(h.substring(2, 4), 16),
        parseInt(h.substring(4, 6), 16),
      ];
    }
  };

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Set colors based on theme
  useEffect(() => {
    const colors = isDarkMode ? {
      bgStart: "rgb(15, 23, 42)",
      bgEnd: "rgb(2, 6, 23)",
      first: "37, 99, 235",
      second: "126, 34, 206",
      third: "6, 182, 212",
      fourth: "190, 24, 93",
      fifth: "21, 128, 61",
      pointer: "37, 99, 235"
    } : {
      bgStart: gradientBackgroundStart,
      bgEnd: gradientBackgroundEnd,
      first: firstColor,
      second: secondColor,
      third: thirdColor,
      fourth: fourthColor,
      fifth: fifthColor,
      pointer: pointerColor
    };

    document.body.style.setProperty("--gradient-background-start", colors.bgStart);
    document.body.style.setProperty("--gradient-background-end", colors.bgEnd);
    document.body.style.setProperty("--first-color", colors.first);
    document.body.style.setProperty("--second-color", colors.second);
    document.body.style.setProperty("--third-color", colors.third);
    document.body.style.setProperty("--fourth-color", colors.fourth);
    document.body.style.setProperty("--fifth-color", colors.fifth);
    document.body.style.setProperty("--pointer-color", colors.pointer);
    document.body.style.setProperty("--size", size);
    document.body.style.setProperty("--blending-value", blendingValue);
  }, [isDarkMode, gradientBackgroundStart, gradientBackgroundEnd, firstColor, secondColor, thirdColor, fourthColor, fifthColor, pointerColor, size, blendingValue]);

  // Animation loop for smooth mouse tracking (fixes infinite loop)
  useEffect(() => {
    let running = true;
    function animate() {
      setCurX(prev => prev + (tgX - prev) / 20);
      setCurY(prev => prev + (tgY - prev) / 20);
      if (running) requestAnimationFrame(animate);
    }
    animate();
    return () => { running = false; };
  }, [tgX, tgY]);

  // Helper: parse rgb string to array
  const parseRGB = (color: string): [number, number, number] => {
    return color.split(',').map(c => parseInt(c.trim(), 10)) as [number, number, number];
  };
  // Helper: rgb array to string
  const rgbToString = (rgb: [number, number, number]) => `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`;
  // Helper: lerp between two rgb arrays
  const lerpColors = (from: [number, number, number], to: [number, number, number], t: number): [number, number, number] => {
    return [
      Math.round(from[0] + (to[0] - from[0]) * t),
      Math.round(from[1] + (to[1] - from[1]) * t),
      Math.round(from[2] + (to[2] - from[2]) * t),
    ];
  };

  // Animation loop for smooth color interpolation (disabled when pointer blobs are off)
  useEffect(() => {
    if (!ENABLE_POINTER_BLOBS) {
      return;
    }
    let running = true;
    function animate() {
      setDynamicPointerColor(prev => {
        const from = parseRGB(prev);
        const to = parseRGB(targetPointerColor);
        if (from.every((v, i) => Math.abs(v - to[i]) < 2)) {
          return rgbToString(to);
        }
        const lerped = lerpColors(from, to, 0.01); // Slower, smoother
        return rgbToString(lerped);
      });

      // Swarm inertia parameters
      setSwarm(prev => {
        return { x: tgX, y: tgY };
      });

      // Animate blob positions (no inertia, just orbit around swarm center)
      setBlobs(prevBlobs =>
        prevBlobs.map(blob => {
          // Lerp angle and radius
          let newAngle = blob.angle + (blob.targetAngle - blob.angle) * blob.speed;
          let newRadius = blob.radius + (blob.targetRadius - blob.radius) * blob.speed;
          // Lerp color toward its own color-aware target
          // Calculate the blob's current screen position
          const blobX = swarm.x + Math.cos(blob.angle) * blob.radius;
          const blobY = swarm.y + Math.sin(blob.angle) * blob.radius;
          // Use selectContrastingColor with the blob's position
          const blobTargetColor = selectContrastingColor(blobX, blobY);
          const from = parseRGB(blob.currentColor);
          const to = parseRGB(blobTargetColor);
          const lerpedColor = lerpColors(from, to, blob.colorLerp); // Each blob has its own color transition speed
          // If close to target, pick new random target
          if (Math.abs(newAngle - blob.targetAngle) < 0.05 && Math.abs(newRadius - blob.targetRadius) < 2) {
            // Find the nearest actual background gradient blob position
            const bgBlobs = [
              { x: 0.05, y: 0.05 }, // top-[5%] left-[5%]
              { x: 0.05, y: 0.95 }, // top-[5%] right-[5%]
              { x: 0.95, y: 0.05 }, // bottom-[5%] left-[5%]
              { x: 0.95, y: 0.95 }, // bottom-[5%] right-[5%]
              { x: 0.5, y: 0.5 },   // top-[50%] left-[50%]
              { x: 0.02, y: 0.10 }, // top-[2%] left-[10%]
              { x: 0.01, y: 0.85 }, // top-[1%] right-[15%]
              { x: 0.03, y: 0.50 }, // top-[3%] left-[50%]
              { x: 0.00, y: 0.30 }, // top-[0%] left-[30%]
              { x: 0.98, y: 0.10 }, // bottom-[2%] left-[10%]
              { x: 0.99, y: 0.85 }, // bottom-[1%] right-[15%]
              { x: 0.97, y: 0.50 }, // bottom-[3%] left-[50%]
              { x: 1.00, y: 0.30 }, // bottom-[0%] left-[30%]
              { x: 0.40, y: 0.05 }, // top-[40%] left-[5%]
              { x: 0.35, y: 0.95 }, // top-[35%] right-[5%]
            ];
            const containerWidth = window.innerWidth;
            const containerHeight = window.innerHeight;
            const swarmNormX = swarm.x / containerWidth;
            const swarmNormY = swarm.y / containerHeight;
            let nearestBlob = bgBlobs[0];
            let minDist = Infinity;
            for (const blobPos of bgBlobs) {
              const dist = Math.hypot(blobPos.x - swarmNormX, blobPos.y - swarmNormY);
              if (dist < minDist) {
                minDist = dist;
                nearestBlob = blobPos;
              }
            }
            // Angle from swarm center to nearest background blob
            const dx = (nearestBlob.x * containerWidth) - swarm.x;
            const dy = (nearestBlob.y * containerHeight) - swarm.y;
            const blobAngle = Math.atan2(dy, dx);
            // Pick a random angle, then bias it toward blobAngle
            let randomAngle = Math.random() * Math.PI * 2;
            // Bias strength depends on distance: closer = stronger bias, farther = weaker bias
            // Use a smoothstep curve for bias: bias = max(0.15, min(0.5, 0.5 - minDist * 0.4))
            // (so bias is 0.5 when on top of blob, 0.15 when far away)
            let bias = 0.5 - Math.min(minDist, 1) * 0.4;
            bias = Math.max(0.15, Math.min(0.5, bias));
            let biasedAngle = randomAngle * (1 - bias) + blobAngle * bias;
            // Normalize angle to [0, 2PI]
            if (biasedAngle < 0) biasedAngle += Math.PI * 2;
            if (biasedAngle > Math.PI * 2) biasedAngle -= Math.PI * 2;
            newAngle = blob.angle;
            newRadius = blob.radius;
            // Allow the radius to exceed the max by up to 40% when bias is strong
            newRadius =
              BLOB_RADIUS_MIN +
              Math.random() * (BLOB_RADIUS_MAX - BLOB_RADIUS_MIN) +
              (BLOB_RADIUS_MAX * 0.4 * (bias - 0.15) / (0.5 - 0.15));
            return {
              ...blob,
              targetAngle: biasedAngle,
              targetRadius: newRadius,
              angle: newAngle,
              radius: newRadius,
              currentColor: rgbToString(lerpedColor),
              color: rgbToString(lerpedColor),
            };
          }
          return {
            ...blob,
            angle: newAngle,
            radius: newRadius,
            currentColor: rgbToString(lerpedColor),
            color: rgbToString(lerpedColor),
          };
        })
      );
      if (running) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    }
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [targetPointerColor, tgX, tgY]);

  // Global mousemove handler for robust tracking (only when pointer blobs enabled)
  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = event.clientX - rect.left;
      const relativeY = event.clientY - rect.top;
      setTgX(relativeX);
      setTgY(relativeY);
      // Update debug sample color on mouse move
      setDebugSample({ x: event.clientX, y: event.clientY });
      // Update target color only
      const contrastingColor = selectContrastingColor(relativeX, relativeY);
      setTargetPointerColor(contrastingColor);
    }
    if (interactive && ENABLE_POINTER_BLOBS) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [interactive]);

  // Register global background color sampling function
  useEffect(() => {
    (window as any).__getBackgroundColorAt = getBackgroundColorAt;
    return () => {
      if ((window as any).__getBackgroundColorAt === getBackgroundColorAt) {
        delete (window as any).__getBackgroundColorAt;
      }
    };
  });

  // Expose live positions of CSS-animated background blobs for color sampling
  useEffect(() => {
    function updateLiveBlobPositions() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Query all background blob elements by a class or data attribute
      const blobNodes = containerRef.current.querySelectorAll('.background-blob');
      const blobs = Array.from(blobNodes).map((el: Element) => {
        const blobRect = (el as HTMLElement).getBoundingClientRect();
        // Center of the blob in container-local coordinates
        const centerX = blobRect.left + blobRect.width / 2 - rect.left;
        const centerY = blobRect.top + blobRect.height / 2 - rect.top;
        // Use computed style or data attribute for color if needed
        const color = (el as HTMLElement).dataset.blobColor || '255,0,0';
        const radius = Math.max(blobRect.width, blobRect.height) / 2;
        return { x: centerX, y: centerY, radius, color };
      });
      // Add pointer-following blobs if enabled
      let pointerBlobs: any[] = [];
      if (ENABLE_POINTER_BLOBS && blobsRef.current && swarmRef.current) {
        pointerBlobs = blobsRef.current.map((blob: any) => {
          // Calculate offset from swarm center using polar coordinates
          const offsetX = Math.cos(blob.angle) * blob.radius;
          const offsetY = Math.sin(blob.angle) * blob.radius;
          // Swarm center is in container-local coordinates
          const swarmX = swarmRef.current.x;
          const swarmY = swarmRef.current.y;
          return {
            x: swarmX + offsetX,
            y: swarmY + offsetY,
            radius: (blob.size || 0.10) * (containerRef.current?.offsetWidth || 0), // size is percent of width
            color: blob.currentColor || pointerColor,
          };
        });
      }
      (window as any).__backgroundBlobs = [...blobs, ...pointerBlobs];
    }
    updateLiveBlobPositions();
    // increase sampling rate for smoother color reads (60fps)
    const interval = setInterval(updateLiveBlobPositions, 1000 / 60); // 60fps
    return () => clearInterval(interval);
  }, [containerRef]);

  // Remove animation frame update for debug sample; rely on mousemove to update debug dot

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  }, []);

  // Set to false to disable mouse-following blobs entirely
  const ENABLE_POINTER_BLOBS = false;

  // Helper: normalize a point to [0,1] within the container
  function normalizeToContainer(x: number, y: number): { normalizedX: number; normalizedY: number } {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { normalizedX: 0, normalizedY: 0 };
    let clampedX = x;
    let clampedY = y;
    if (clampedX < rect.left) clampedX = rect.left;
    if (clampedX > rect.right) clampedX = rect.right;
    if (clampedY < rect.top) clampedY = rect.top;
    if (clampedY > rect.bottom) clampedY = rect.bottom;
    return {
      normalizedX: (clampedX - rect.left) / rect.width,
      normalizedY: (clampedY - rect.top) / rect.height,
    };
  }

  // Helper: convert window (client) coordinates to normalized [0,1] in container
  function windowToNormalized(x: number, y: number): { normalizedX: number; normalizedY: number } {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { normalizedX: 0, normalizedY: 0 };
    return {
      normalizedX: (x - rect.left) / rect.width,
      normalizedY: (y - rect.top) / rect.height,
    };
  }

  // Helper: convert normalized [0,1] in container to window (client) coordinates
  function normalizedToWindow(normalizedX: number, normalizedY: number): { x: number; y: number } {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: rect.left + normalizedX * rect.width,
      y: rect.top + normalizedY * rect.height,
    };
  }

  // Render a red dot at the last sampled coordinate (for debug)
  const renderDebugSampleDot = () => {
    if (!debugSample || !containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const { normalizedX: debugNormX, normalizedY: debugNormY } = windowToNormalized(debugSample.x, debugSample.y);
    // Map normalized back to container pixel space
    const { x: dotX, y: dotY } = normalizedToWindow(debugNormX, debugNormY);
    return (
      <div
        style={{
          position: "fixed",
          left: dotX - 6,
          top: dotY - 6,
          width: 12,
          height: 12,
          borderRadius: 6,
          background: "red",
          zIndex: 99999,
          pointerEvents: "none",
          boxShadow: "0 0 8px 2px rgba(255,0,0,0.5)",
        }}
      />
    );
  };

  // Render a debug dot at every blob's center
  const renderAllBlobDebugDots = () => {
    if (!containerRef.current || !(window as any).__backgroundBlobs) return null;
    const blobs: any[] = (window as any).__backgroundBlobs;
    const rect = containerRef.current.getBoundingClientRect();
    return blobs.map((blob, i) => (
      <div
        key={i}
        style={{
          position: "fixed",
          left: rect.left + blob.x - 6,
          top: rect.top + blob.y - 6,
          width: 12,
          height: 12,
          borderRadius: 6,
          background: "red",
          border: "2px solid black",
          zIndex: 99999,
          pointerEvents: "none",
          boxShadow: "0 0 8px 2px rgba(255,0,0,0.5)",
        }}
      />
    ));
  };

  // Track debug tick for periodic re-render
  const [debugTick, setDebugTick] = useState(0);
  // # NEW CODE - TESTING: periodic debug sampler
  useEffect(() => {
    // Store the last sampled mouse position
    let lastX = 0;
    let lastY = 0;
    function updateLastMouse(e: MouseEvent) {
      lastX = e.clientX;
      lastY = e.clientY;
    }
    window.addEventListener('mousemove', updateLastMouse);
    // Sample every 500ms
    const interval = setInterval(() => {
      if (typeof (window as any).__getBackgroundColorAt === 'function') {
        (window as any).__getBackgroundColorAt(lastX, lastY);
      }
      setDebugTick(tick => tick + 1); // force re-render of debug dots
    }, 500);
    return () => {
      window.removeEventListener('mousemove', updateLastMouse);
      clearInterval(interval);
    };
  }, []);

  // OLD CODE - KEEP UNTIL CONFIRMED WORKING
  // Return early for mobile devices to disable animations and gradients
  if (shouldDisableAnimations) {
    return (
      <BackgroundColorContext.Provider value={{ getBackgroundColorAt: () => "rgb(255, 255, 255)" }}>
        <div
          ref={containerRef}
          className={cn(
            "h-full w-full relative overflow-hidden top-0 left-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 pointer-events-none",
            containerClassName
          )}
        >
          {children}
        </div>
      </BackgroundColorContext.Provider>
    );
  }

  // NEW CODE - TESTING
  return (
    <BackgroundColorContext.Provider value={{ getBackgroundColorAt }}>
      <>
        <div
          ref={containerRef}
          className={cn(
            "h-full w-full relative overflow-hidden top-0 left-0 bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))] pointer-events-none",
            containerClassName
          )}
        >
          <svg className="hidden">
            <defs>
              <filter id="blurMe">
                <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                <feColorMatrix
                  in="blur"
                  mode="matrix"
                  values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                  result="goo"
                />
                <feBlend in="SourceGraphic" in2="goo" />
              </filter>
            </defs>
          </svg>
          <div className={className}>{children}</div>
          <div
            className={cn(
              "gradients-container h-full w-full blur-lg",
              isSafari ? "blur-2xl" : "[filter:url(#blurMe)_blur(40px)]"
            )}
          >
            {/* Evenly distributed background blobs: corners, edges, center */}
            <div
              className={cn(
                "background-blob absolute [background:radial-gradient(circle_at_center,_var(--first-color)_0,_var(--first-color)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[5%] left-[5%] [transform-origin:top_left] animate-first opacity-100"
              )}
              data-blob-color={firstColor}
            ></div>
            <div
              className={cn(
                "background-blob absolute [background:radial-gradient(circle_at_center,_rgba(var(--second-color),_0.8)_0,_rgba(var(--second-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[5%] right-[5%] [transform-origin:top_right] animate-second opacity-100"
              )}
              data-blob-color={secondColor}
            ></div>
            <div
              className={cn(
                "background-blob absolute [background:radial-gradient(circle_at_center,_rgba(var(--third-color),_0.8)_0,_rgba(var(--third-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] bottom-[5%] left-[5%] [transform-origin:bottom_left] animate-third opacity-100"
              )}
              data-blob-color={thirdColor}
            ></div>
            <div
              className={cn(
                "background-blob absolute [background:radial-gradient(circle_at_center,_rgba(var(--fourth-color),_0.8)_0,_rgba(var(--fourth-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] bottom-[5%] right-[5%] [transform-origin:bottom_right] animate-fourth opacity-70"
              )}
              data-blob-color={fourthColor}
            ></div>
            <div
              className={cn(
                "background-blob absolute [background:radial-gradient(circle_at_center,_rgba(var(--fifth-color),_0.8)_0,_rgba(var(--fifth-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[50%] left-[50%] [transform-origin:center_center] animate-fifth opacity-100"
              )}
              data-blob-color={fifthColor}
            ></div>
            {/* Additional gradients for better coverage - very top areas */}
            <div
              className={cn(
                "background-blob absolute [background:radial-gradient(circle_at_center,_rgba(var(--first-color),_0.8)_0,_rgba(var(--first-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[2%] left-[10%] [transform-origin:top_left] animate-first opacity-100"
              )}
              data-blob-color={firstColor}
            ></div>
            <div
              className={cn(
                "background-blob absolute [background:radial-gradient(circle_at_center,_rgba(var(--second-color),_0.8)_0,_rgba(var(--second-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[1%] right-[15%] [transform-origin:top_right] animate-second opacity-100"
              )}
              data-blob-color={secondColor}
            ></div>
            <div
              className={cn(
                "background-blob absolute [background:radial-gradient(circle_at_center,_rgba(var(--third-color),_0.8)_0,_rgba(var(--third-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[3%] left-[50%] [transform-origin:top_center] animate-third opacity-100"
              )}
              data-blob-color={thirdColor}
            ></div>
            <div
              className={cn(
                "background-blob absolute [background:radial-gradient(circle_at_center,_rgba(var(--fourth-color),_0.8)_0,_rgba(var(--fourth-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[0%] left-[30%] [transform-origin:top_left] animate-fourth opacity-100"
              )}
              data-blob-color={fourthColor}
            ></div>
            {/* Additional gradients for better coverage - very bottom areas */}
            <div
              className={cn(
                "background-blob absolute [background:radial-gradient(circle_at_center,_rgba(var(--third-color),_0.8)_0,_rgba(var(--third-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] bottom-[2%] left-[10%] [transform-origin:bottom_left] animate-third opacity-100"
              )}
              data-blob-color={thirdColor}
            ></div>
            <div
              className={cn(
                "background-blob absolute [background:radial-gradient(circle_at_center,_rgba(var(--fourth-color),_0.8)_0,_rgba(var(--fourth-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] bottom-[1%] right-[15%] [transform-origin:bottom_right] animate-fourth opacity-100"
              )}
              data-blob-color={fourthColor}
            ></div>
            <div
              className={cn(
                "background-blob absolute [background:radial-gradient(circle_at_center,_rgba(var(--fifth-color),_0.8)_0,_rgba(var(--fifth-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] bottom-[3%] left-[50%] [transform-origin:bottom_center] animate-fifth opacity-100"
              )}
              data-blob-color={fifthColor}
            ></div>
            <div
              className={cn(
                "background-blob absolute [background:radial-gradient(circle_at_center,_rgba(var(--first-color),_0.8)_0,_rgba(var(--first-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] bottom-[0%] left-[30%] [transform-origin:bottom_left] animate-first opacity-100"
              )}
              data-blob-color={firstColor}
            ></div>
            {/* Additional gradients for better coverage - middle areas */}
            <div
              className={cn(
                "background-blob absolute [background:radial-gradient(circle_at_center,_rgba(var(--fifth-color),_0.5)_0,_rgba(var(--fifth-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[40%] left-[5%] [transform-origin:left_center] animate-fifth opacity-70"
              )}
              data-blob-color={fifthColor}
            ></div>
            <div
              className={cn(
                "background-blob absolute [background:radial-gradient(circle_at_center,_rgba(var(--first-color),_0.5)_0,_rgba(var(--first-color),_0)_50%)_no-repeat] [mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[35%] right-[5%] [transform-origin:right_center] animate-first opacity-70"
              )}
              data-blob-color={firstColor}
            ></div>
            {ENABLE_POINTER_BLOBS && interactive && (
              <>
                {blobs.map((blob) => {
                  // Calculate offset from swarm center using polar coordinates
                  const offsetX = Math.cos(blob.angle) * blob.radius;
                  const offsetY = Math.sin(blob.angle) * blob.radius;
                  return (
                    <div
                      key={blob.id}
                      style={{
                        background: `radial-gradient(circle at center, rgba(${blob.currentColor}, 0.6) 0%, rgba(${blob.currentColor}, 0.4) 30%, rgba(${blob.currentColor}, 0) 100%)`,
                        mixBlendMode: 'normal',
                        position: 'absolute',
                        width: `${blob.size * 100}%`,
                        height: `${blob.size * 100}%`,
                        top: `calc(${swarm.y + offsetY}px - ${blob.size * 50}%)`,
                        left: `calc(${swarm.x + offsetX}px - ${blob.size * 50}%)`,
                        opacity: 0.8,
                        pointerEvents: 'none',
                        transition: 'none',
                        filter: 'blur(48px)',
                      }}
                    />
                  );
                })}
              </>
            )}
          </div>
        </div>
        {/*
        {renderDebugSampleDot()}
        */}
        {/*
        {renderAllBlobDebugDots()}
        */}
      </>
    </BackgroundColorContext.Provider>
  );
};