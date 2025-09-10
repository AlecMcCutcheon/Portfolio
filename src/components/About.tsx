import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { User, Target, Award, Heart, PocketKnife, HelpCircle, BrainCircuit, Book, Eye, Globe } from 'lucide-react';
import { useEffect } from 'react';
import { useRef, useLayoutEffect } from 'react';
import { useCallback } from 'react';
import { BackgroundGradientAnimation, BackgroundColorContext } from '../ui/background-gradient-animation';
import SpotlightGlow from '../ui/SpotlightGlow';
import { GlassCard } from '../ui/GlassCard';

// Define regions as {name, topMin, topMax, leftMin, leftMax}
type Region = { name: string; topMin: number; topMax: number; leftMin: number; leftMax: number };

// Utility to get a random value in a range
function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// Helper: color distance (simple RGB Euclidean distance)
function colorDistance(a: string, b: string): number {
  function hexToRgb(hex: string) {
    const h = hex.replace('#', '');
    return [parseInt(h.substring(0, 2), 16), parseInt(h.substring(2, 4), 16), parseInt(h.substring(4, 6), 16)];
  }
  const rgbA = hexToRgb(a);
  const rgbB = hexToRgb(b);
  return Math.sqrt((rgbA[0] - rgbB[0]) ** 2 + (rgbA[1] - rgbB[1]) ** 2 + (rgbA[2] - rgbB[2]) ** 2);
}

// Morphing SVG paths for more fluid blobs
const blobShapes = [
  // Symmetric and asymmetric, more organic shapes
  'M200,60 Q300,100 340,200 Q300,300 200,340 Q100,300 60,200 Q100,100 200,60Z',
  'M220,80 Q340,120 320,220 Q340,320 200,320 Q60,320 80,200 Q60,80 220,80Z',
  'M200,100 Q320,140 340,200 Q320,260 200,300 Q80,260 60,200 Q80,140 200,100Z',
  'M180,80 Q300,60 340,200 Q300,340 200,340 Q100,340 60,200 Q100,60 180,80Z',
  'M200,140 Q320,180 340,200 Q320,220 200,260 Q80,220 60,200 Q80,180 200,140Z',
  // More asymmetric/organic
  'M200,60 Q320,120 380,180 Q340,320 200,340 Q80,320 60,200 Q120,80 200,60Z',
  'M200,80 Q350,120 320,250 Q300,350 200,320 Q100,350 80,200 Q120,100 200,80Z',
  'M220,100 Q340,180 320,220 Q340,320 200,340 Q60,320 80,200 Q100,80 220,100Z',
  'M180,120 Q300,60 340,200 Q320,340 200,320 Q100,340 60,200 Q120,120 180,120Z',
  'M200,120 Q320,160 380,200 Q320,240 200,280 Q80,240 60,200 Q120,160 200,120Z',
];

const gradients = [
  ["#a5b4fc", "#fca5a5"], // primary to secondary
  ["#fca5a5", "#f9a8d4"], // secondary to pink
  ["#f9a8d4", "#38bdf8"], // pink to blue
  ["#38bdf8", "#a5b4fc"], // blue to primary
  ["#fca5a5", "#fcd34d"], // secondary to yellow
  ["#6ee7b7", "#a5b4fc"], // green to primary
];

// FIX: Ensure blobs can reach the full 0-100% area, not just 0-80%
function getRandomPosition(size: number) {
  return {
    top: randomInRange(0, 100),
    left: randomInRange(0, 100),
  };
}

// Helper to check if two positions are at least minDist apart
function isFarEnough(pos: { top: number; left: number }, others: { top: number; left: number }[], minDist: number) {
  return others.every(other => {
    const dx = pos.left - other.left;
    const dy = pos.top - other.top;
    return Math.sqrt(dx * dx + dy * dy) >= minDist;
  });
}

// Generate N spread out positions
function generateSpreadPositions(n: number, minDist = 20) {
  const positions = [];
  let tries = 0;
  while (positions.length < n && tries < 1000) {
    const pos = getRandomPosition(400);
    if (isFarEnough(pos, positions, minDist)) {
      positions.push(pos);
    }
    tries++;
  }
  // If not enough, just fill with random
  while (positions.length < n) {
    positions.push(getRandomPosition(400));
  }
  return positions;
}

// Define symmetric regions for even distribution
const BLOB_REGIONS = [
  { name: 'upperLeft', topMin: 0, topMax: 40, leftMin: 0, leftMax: 50 },
  { name: 'upperRight', topMin: 0, topMax: 40, leftMin: 50, leftMax: 100 },
  { name: 'lowerLeft', topMin: 60, topMax: 100, leftMin: 0, leftMax: 50 },
  { name: 'lowerRight', topMin: 60, topMax: 100, leftMin: 50, leftMax: 100 },
  { name: 'center', topMin: 30, topMax: 70, leftMin: 25, leftMax: 75 },
];

// Clamp a value to a range (allow edge-to-edge, or slightly beyond for organic effect)
function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// Helper to get the center of a region, allow 0–100%
function getRegionCenter(region: Region): { top: number; left: number } {
  return {
    top: clamp((region.topMin + region.topMax) / 2, 0, 100),
    left: clamp((region.leftMin + region.leftMax) / 2, 0, 100),
  };
}

// Helper to get the center of the section (for global fade)
const SECTION_CENTER = { top: 50, left: 50 };

// Helper to get max fade distance (diagonal of section in percent)
const MAX_FADE_DIST = 80; // percent, tweak as needed

// Map distance to fade (1 = fully visible, 0 = fully faded)
function fadeLevelFromDistance(dist: number, maxDist: number): number {
  if (dist < 10) return 1;
  if (dist > maxDist) return 0;
  return 1 - (dist - 10) / (maxDist - 10);
}

// Get a random position in a region, allow 0–100% (or slightly beyond for organic effect)
function getRandomPositionInRegion(region: Region, size: number): { top: number; left: number } {
  // FIX: Use the full region range, do not shrink or offset
  return {
    top: clamp(randomInRange(region.topMin, region.topMax), 0, 100),
    left: clamp(randomInRange(region.leftMin, region.leftMax), 0, 100),
  };
}

function getRegionForIndex(idx: number): Region {
  return BLOB_REGIONS[idx % BLOB_REGIONS.length];
}

function isInRegion(pos: { top: number; left: number }, region: Region): boolean {
  return (
    pos.top >= region.topMin && pos.top <= region.topMax &&
    pos.left >= region.leftMin && pos.left <= region.leftMax
  );
}

// Helper to generate a color-aware blob config
function randomBlobConfig(
  idx: number,
  usedPositions: { top: number; left: number }[] = [],
  region: Region | null = null,
  allBlobs: any[] = []
): any {
  const gradientsList = gradients;
  const size = randomInRange(340, 520);
  let pos: { top: number; left: number };
  let tries = 0;
  const regionToUse = region || getRegionForIndex(idx);
  do {
    pos = getRandomPositionInRegion(regionToUse, size);
    tries++;
  } while (
    usedPositions.some(
      (other) => Math.sqrt(Math.pow(pos.left - other.left, 2) + Math.pow(pos.top - other.top, 2)) < 18
    ) && tries < 10
  );
  // Color awareness: pick least-used gradient
  const gradientUsage = gradientsList.map((g, i) =>
    allBlobs.filter(b => b && b.gradientIdx === i).length
  );
  const minUsage = Math.min(...gradientUsage);
  const candidates = gradientsList.map((g, i) => i).filter(i => gradientUsage[i] === minUsage);
  const gradientIdx = candidates[Math.floor(Math.random() * candidates.length)];
  return {
    key: `${Date.now()}-${Math.random()}`,
    idx,
    duration: randomInRange(16, 26),
    size,
    initialOpacity: randomInRange(0.28, 0.5),
    initialPos: pos,
    gradientIdx,
    lifespan: randomInRange(30, 60), // 30s to 60s
    region: regionToUse,
  };
}

// Weighted random choice utility
function weightedRandomChoice<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    if (r < weights[i]) return items[i];
    r -= weights[i];
  }
  return items[items.length - 1];
}

// Helper to get which region a position is in (returns region index or -1)
function getRegionIndexForPos(pos: { top: number; left: number }): number {
  for (let i = 0; i < BLOB_REGIONS.length; i++) {
    if (isInRegion(pos, BLOB_REGIONS[i])) return i;
  }
  return -1;
}

// MovingBlob now supports lifespan and fade out, and accepts gradientIdx
interface MovingBlobProps {
  idx: number;
  duration?: number;
  size?: number;
  initialOpacity?: number;
  initialPos: { top: number; left: number };
  gradientIdx?: number;
  lifespan?: number;
  region?: Region;
  onFadeOut?: (leftRegionEarly?: boolean) => void;
  regionCounts?: number[];
  allRegions?: Region[];
  setIntent?: (pos: { top: number; left: number }) => void;
  clearIntent?: () => void;
  containerSize: { width: number; height: number };
  allBlobs?: any[];
}

function MovingBlob({
  idx,
  duration = 16,
  size = 400,
  initialOpacity = 0.5,
  initialPos,
  gradientIdx = 0,
  lifespan = 24,
  region,
  onFadeOut,
  regionCounts = [],
  allRegions = [],
  setIntent,
  clearIntent,
  containerSize,
  allBlobs = [],
}: MovingBlobProps) {
  const initialPosRef = useRef(initialPos);
  const [scale, setScale] = useState(randomInRange(0.8, 1.2));
  const [opacity, setOpacity] = useState(initialOpacity);
  const [shapeIdx, setShapeIdx] = useState(0);
  const [targetPos, setTargetPos] = useState(initialPosRef.current);
  const [fading, setFading] = useState(false);
  // Distance-based fade
  const [fadeLevel, setFadeLevel] = useState(1);
  // Smooth fade-in
  const [fadeInLevel, setFadeInLevel] = useState(0);
  // State for per-move duration and a trigger to force rerender for next move
  const [moveDuration, setMoveDuration] = useState(4.5);
  const [moveTrigger, setMoveTrigger] = useState(0);

  // Animate fade-in on mount
  useEffect(() => {
    setFadeInLevel(0);
    const start = Date.now();
    let raf: number;
    function animate() {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / 1500);
      setFadeInLevel(t);
      if (t < 1) raf = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Fade based on distance from nearest region center (or section center)
  useEffect(() => {
    // Find closest region center
    let minDist = Infinity;
    for (const reg of allRegions) {
      const center = getRegionCenter(reg);
      const dx = (targetPos.left - center.left);
      const dy = (targetPos.top - center.top);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) minDist = dist;
    }
    // Optionally, also fade based on distance from section center for global fade
    // const dxC = (targetPos.left - SECTION_CENTER.left);
    // const dyC = (targetPos.top - SECTION_CENTER.top);
    // minDist = Math.min(minDist, Math.sqrt(dxC * dxC + dyC * dyC));
    const fade = fadeLevelFromDistance(minDist, MAX_FADE_DIST);
    setFadeLevel(fade);
    if (fade <= 0.01 && !fading) {
      setFading(true);
      setTimeout(() => {
        if (onFadeOut) onFadeOut(true);
      }, 1800);
    }
  }, [targetPos, allRegions, fading, onFadeOut]);

  // Staggered/randomized movement interval
  useEffect(() => {
    let isMounted = true;
    const initialDelay = randomInRange(0, 2000);
    const timer = setTimeout(() => {
      function drift() {
        if (!isMounted) return;
        let targetRegion = region!;
        // Gather all other blobs' current and intended positions
        const w = window as any;
        const otherPositions: { top: number; left: number }[] = [];
        if (w.__blobPositions) {
          for (const p of w.__blobPositions) {
            if (p !== undefined && p !== targetPos) otherPositions.push(p);
          }
        }
        // Calculate container diagonal for clamping
        const diag = Math.sqrt(containerSize.width ** 2 + containerSize.height ** 2);
        let bestCandidate = null;
        let bestDist = -1;
        // PURE UNIFORM RANDOM MOVES FOR DEBUGGING
        for (let c = 0; c < 6; c++) {
          let candidate;
          // FIX: Use full 0-100% range for both axes
          candidate = { top: randomInRange(0, 100), left: randomInRange(0, 100) };
          // Clamp progress for long moves
          const pxA = {
            x: (targetPos.left / 100) * containerSize.width,
            y: (targetPos.top / 100) * containerSize.height,
          };
          const pxB = {
            x: (candidate.left / 100) * containerSize.width,
            y: (candidate.top / 100) * containerSize.height,
          };
          const distPx = Math.sqrt((pxA.x - pxB.x) ** 2 + (pxA.y - pxB.y) ** 2);
          let maxProgress = 1.0;
          if (distPx > 0.4 * diag) maxProgress = 0.5;
          const progress = randomInRange(0.2, maxProgress);
          const newTarget = lerpPos(targetPos, candidate, progress);
          const dist = minDistanceToOthers(newTarget, otherPositions);
          if (dist > bestDist) {
            bestDist = dist;
            bestCandidate = newTarget;
          }
        }
        const safeTarget = bestCandidate ?? targetPos;
        // Convert percent positions to pixel positions
        function percentToPx(pos: { top: number; left: number }) {
          return {
            x: (pos.left / 100) * containerSize.width,
            y: (pos.top / 100) * containerSize.height,
          };
        }
        const pxA = percentToPx(targetPos);
        const pxB = percentToPx(safeTarget);
        const moveDistPx = Math.sqrt((pxA.x - pxB.x) ** 2 + (pxA.y - pxB.y) ** 2);
        let pxSpeed = 3; // pixels per second (much slower)
        if (moveDistPx > 0.7 * diag) pxSpeed = 0.4; // extremely slow for very long moves
        else if (moveDistPx > 0.4 * diag) pxSpeed = 1; // very slow for long moves
        let durationSec = moveDistPx / pxSpeed;
        durationSec = Math.max(12, Math.min(durationSec, 90));
        setTargetPos(safeTarget);
        setScale(randomInRange(0.8, 1.3));
        setShapeIdx((prev) => (prev + 1) % blobShapes.length);
        if (setIntent) setIntent(safeTarget);
        setMoveDuration(durationSec);
        setMoveTrigger(t => t + 1); // force rerender for next move
      }
      drift();
    }, initialDelay);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [moveTrigger, size, region, regionCounts, allRegions, setIntent, targetPos, containerSize]);

  // When the blob reaches its target, set a new one
  useEffect(() => {
    if (fading) return;
    // No setTimeout for next move; handled by onAnimationComplete
  }, [moveTrigger, fading, region, regionCounts, allRegions, setIntent]);

  // Clear intent when blob reaches its target (i.e., on fade out or respawn)
  useEffect(() => {
    if (fading && clearIntent) clearIntent();
  }, [fading, clearIntent]);

  // Optional: Lifespan fade out (secondary to distance-based fade)
  useEffect(() => {
    if (!lifespan) return;
    if (fading) return;
    const fadeTimeout = setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        if (onFadeOut) onFadeOut(false);
      }, 1800);
    }, lifespan * 1000);
    return () => clearTimeout(fadeTimeout);
  }, [lifespan, onFadeOut, fading]);

  // Track all blob positions globally for avoidance
  useEffect(() => {
    const w = window as any;
    if (!w.__blobPositions) w.__blobPositions = [];
    w.__blobPositions[idx] = targetPos;
    return () => {
      if (w.__blobPositions) w.__blobPositions[idx] = undefined;
    };
  }, [targetPos, idx]);

  // DEBUG: Log this blob's position on every move
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(`Blob ${idx} position: [${targetPos.top.toFixed(1)}, ${targetPos.left.toFixed(1)}]`);
  }, [targetPos, idx]);

  // State for color adaptation
  const [currentGradientIdx, setCurrentGradientIdx] = useState(gradientIdx);
  const [gradientTransition, setGradientTransition] = useState<number | null>(null);

  // Gradually adapt color if close to another blob with similar color
  useEffect(() => {
    if (!allBlobs.length) return;
    // Find closest blob (excluding self)
    let minDist = Infinity;
    let closestIdx = -1;
    for (let i = 0; i < allBlobs.length; i++) {
      if (i === idx) continue;
      const b = allBlobs[i];
      if (!b || typeof b.targetPos === 'undefined') continue;
      const d = posDistance(targetPos, b.targetPos);
      if (d < minDist) {
        minDist = d;
        closestIdx = i;
      }
    }
    if (closestIdx !== -1 && minDist < 18) { // If close to another blob
      const otherGradientIdx = allBlobs[closestIdx].gradientIdx ?? allBlobs[closestIdx].currentGradientIdx;
      // If color is similar, adapt to a less-used color
      const myColors = gradients[currentGradientIdx];
      const otherColors = gradients[otherGradientIdx];
      const colorDist = colorDistance(myColors[0], otherColors[0]) + colorDistance(myColors[1], otherColors[1]);
      if (colorDist < 120) {
        // Find a less-used, more distinct gradient
        const usage = gradients.map((g, i) => allBlobs.filter(b => b && (b.gradientIdx === i || b.currentGradientIdx === i)).length);
        const minUsage = Math.min(...usage);
        const candidates = gradients.map((g, i) => i).filter(i => usage[i] === minUsage && i !== currentGradientIdx && colorDistance(gradients[i][0], myColors[0]) + colorDistance(gradients[i][1], myColors[1]) > 120);
        if (candidates.length > 0) {
          const newIdx = candidates[Math.floor(Math.random() * candidates.length)];
          // Gradually transition to newIdx
          setGradientTransition(newIdx);
        }
      }
    }
  }, [targetPos, allBlobs, currentGradientIdx, idx]);

  // Animate gradient transition
  useEffect(() => {
    if (gradientTransition === null) return;
    const startIdx = currentGradientIdx;
    const endIdx = gradientTransition;
    let t = 0;
    const duration = 2.5; // seconds
    let raf: number;
    function animate() {
      t += 1 / 60 / duration;
      if (t >= 1) {
        setCurrentGradientIdx(endIdx);
        setGradientTransition(null);
        return;
      }
      // Optionally, could interpolate colors here for a true gradient blend
      raf = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(raf);
  }, [gradientTransition, currentGradientIdx]);

  // Animate opacity for fade in, fade out, and distance
  const motionOpacity = fading ? 0 : (opacity * fadeLevel * fadeInLevel);

  return (
    <motion.div
      style={{
        position: "absolute",
        width: size,
        height: size,
        opacity: motionOpacity,
        zIndex: 0,
        pointerEvents: "none",
        top: `${initialPosRef.current.top}%`,
        left: `${initialPosRef.current.left}%`,
      }}
      animate={{
        top: `${targetPos.top}%`,
        left: `${targetPos.left}%`,
        scale,
        opacity: motionOpacity,
      }}
      transition={{
        top: { duration: moveDuration, ease: "linear" },
        left: { duration: moveDuration, ease: "linear" },
        scale: { duration: duration, ease: "easeInOut" },
        opacity: { duration: 2.5, ease: "easeInOut" },
      }}
      onUpdate={() => {
        // No-op, but could be used for live position tracking
      }}
      onAnimationComplete={() => {
        if (!fading) setMoveTrigger(t => t + 1);
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: "blur(32px)", mixBlendMode: "plus-lighter" }}
      >
        <defs>
          <linearGradient id={`blobGradient${idx}`} x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
            <stop stopColor={gradients[gradientTransition !== null ? gradientTransition : currentGradientIdx][0]} />
            <stop offset="1" stopColor={gradients[gradientTransition !== null ? gradientTransition : currentGradientIdx][1]} />
          </linearGradient>
        </defs>
        <motion.path
          fill={`url(#blobGradient${idx})`}
          d={blobShapes[shapeIdx]}
          animate={{
            d: blobShapes[(shapeIdx + 1) % blobShapes.length],
          }}
          transition={{
            duration: duration / 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />
      </svg>
    </motion.div>
  );
}

// Interpolate between two positions by a progress percentage
function lerpPos(a: { top: number; left: number }, b: { top: number; left: number }, t: number): { top: number; left: number } {
  return {
    top: a.top + (b.top - a.top) * t,
    left: a.left + (b.left - a.left) * t,
  };
}

// Helper to get minimum distance from a point to a set of points
function minDistanceToOthers(pos: { top: number; left: number }, others: { top: number; left: number }[]): number {
  if (others.length === 0) return Infinity;
  return Math.min(...others.map(o => Math.sqrt((pos.top - o.top) ** 2 + (pos.left - o.left) ** 2)));
}

// Helper to calculate Euclidean distance between two positions
function posDistance(a: { top: number; left: number }, b: { top: number; left: number }): number {
  return Math.sqrt((a.top - b.top) ** 2 + (a.left - b.left) ** 2);
}

// BlobsBackground manages the lifecycle of all blobs
interface BlobsBackgroundProps {
  count: number;
  containerRef: React.RefObject<HTMLElement>;
}

const BlobsBackground: React.FC<BlobsBackgroundProps> = ({ count, containerRef }) => {
  const [blobs, setBlobs] = useState<any[]>([]);
  // Shared movement intent queue: array of { regionIdx: number, pos: {top, left} } or null
  type BlobIntent = { regionIdx: number; pos: { top: number; left: number } } | undefined;
  const [intents, setIntents] = useState<BlobIntent[]>([]);

  useEffect(() => {
    const newBlobs: any[] = [];
    for (let i = 0; i < count; i++) {
      const region = getRegionForIndex(i);
      newBlobs.push(randomBlobConfig(i, newBlobs.map(b => b.initialPos), region));
    }
    setBlobs(newBlobs);
    setIntents(Array(count).fill(undefined));
  }, [count]);

  // When a blob fades out, respawn in its region and clear its intent
  const handleFadeOut = (i: number, region: Region) => {
    setBlobs(prev => prev.map((b, j) =>
      j === i
        ? randomBlobConfig(i, prev.map(b2 => b2.initialPos), region, prev)
        : b
    ));
    setIntents(prev => prev.map((intent, j) => (j === i ? undefined : intent)));
  };

  // Calculate region fullness for movement bias, factoring in intents
  const regionCounts = BLOB_REGIONS.map((region, idx) =>
    blobs.filter(b => isInRegion((b.targetPos || b.initialPos), region)).length +
    intents.filter(intent => intent && intent.regionIdx === idx).length
  );

  // Functions for blobs to update/clear their intent
  const setBlobIntent = (blobIdx: number, pos: { top: number; left: number }) => {
    const regionIdx = getRegionIndexForPos(pos);
    setIntents(prev => prev.map((intent, i) => (i === blobIdx ? { regionIdx, pos } : intent)));
  };
  const clearBlobIntent = (blobIdx: number) => {
    setIntents(prev => prev.map((intent, i) => (i === blobIdx ? undefined : intent)));
  };

  // Get container size in pixels
  const [containerSize, setContainerSize] = useState({ width: 1, height: 1 });
  useLayoutEffect(() => {
    function updateSize() {
      if (containerRef.current) {
        const rect = (containerRef.current as HTMLElement).getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [containerRef]);

  // DEBUG: Log all blob positions after each move (in BlobsBackground scope)
  useEffect(() => {
    if (blobs.length > 0) {
      const positions = blobs.map(b => b && b.targetPos ? `[${b.targetPos.top.toFixed(1)},${b.targetPos.left.toFixed(1)}]` : '[]').join(' ');
      // eslint-disable-next-line no-console
      console.log('Blob positions:', positions);
    }
  }, [blobs]);

  // Expose animated blob positions, sizes, and colors globally for color sampling
  useEffect(() => {
    (window as any).__backgroundBlobs = blobs.map(blob => ({
      // Convert percent positions to px
      x: (blob.targetPos?.left ?? blob.initialPos.left) / 100 * containerSize.width,
      y: (blob.targetPos?.top ?? blob.initialPos.top) / 100 * containerSize.height,
      radius: (blob.size ?? 400) / 2, // size is px diameter, radius is px
      color: blob.gradientIdx !== undefined ? gradients[blob.gradientIdx][0] : '#a5b4fc',
    }));
  }, [blobs, containerSize]);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {blobs.map((blob, i) => (
        <MovingBlob
          key={blob.key}
          idx={blob.idx as number}
          duration={blob.duration}
          size={blob.size}
          initialOpacity={blob.initialOpacity}
          initialPos={blob.initialPos}
          gradientIdx={blob.gradientIdx}
          lifespan={blob.lifespan}
          region={blob.region}
          onFadeOut={(leftRegionEarly) => handleFadeOut(i, blob.region)}
          regionCounts={regionCounts}
          allRegions={BLOB_REGIONS}
          setIntent={(pos) => setBlobIntent(i, pos)}
          clearIntent={() => clearBlobIntent(i)}
          containerSize={containerSize}
          allBlobs={blobs as any[]}
        />
      ))}
    </div>
  );
};

const ENABLE_ABOUT_GLASS_OVERLAY = false;

const About: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  // About section animation
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.01,
  });

  // Skills section animation
  const [skillsRef, skillsInView] = useInView({ triggerOnce: true, threshold: 0.01 });

  // Values section animation
  const [valuesRef, valuesInView] = useInView({ triggerOnce: true, threshold: 0.01 });

  const skills = [
    'PowerShell', 'System Administration', 'Web Development', 'HTML/CSS/JavaScript', 
    'Hardware Troubleshooting', 'Network Setup', 'Azure AD', 'ConnectWise Automate',
    'Malware Detection', 'System Hardening', 'Automation Scripting', 'IT Support'
  ];

  const values = [
    {
      icon: <Target className="w-6 h-6" />,
      title: 'Empowering Others',
      description: 'I find purpose in helping people unlock their potential—whether through technology, education, or support.'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Pursuit of Excellence',
      description: 'I strive for quality and continuous improvement in everything I do, never settling for "good enough."'
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Service Through Technology',
      description: 'I use my technical skills to make a positive difference—solving real problems and serving my community.'
    },
    {
      icon: <PocketKnife className="w-6 h-6" />,
      title: 'Resourceful Problem-Solving',
      description: "I thrive on finding creative solutions, adapting quickly, and making the most of what's available."
    },
    {
      icon: <BrainCircuit className="w-6 h-6" />,
      title: 'Relentless Curiosity',
      description: "I'm driven by a desire to learn, experiment, and explore new ideas—especially in emerging tech and automation."
    },
    {
      icon: <HelpCircle className="w-6 h-6" />,
      title: 'Community Impact',
      description: 'I believe in giving back—whether through volunteering, open-source, or building tools that help others.'
    },
    {
      icon: <Book className="w-6 h-6" />,
      title: 'Lifelong Growth',
      description: 'I see every challenge as an opportunity to grow, always seeking new knowledge and skills to stay ahead in a rapidly changing world.'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Integrity & Trust',
      description: 'Honesty and reliability are at the core of my work—I strive to build lasting trust and strong relationships.'
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: 'Vision for the Future',
      description: "I'm inspired by technology's power to connect people and shape a brighter, more empathetic future for everyone."
    },
  ];

  const skillGroups = [
    { id: 'all', label: 'All', color: 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-gray-100' },
    { id: 'featured', label: 'Featured', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' },
    { id: 'automation', label: 'Automation', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' },
    { id: 'devops', label: 'DevOps', color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' },
    { id: 'web', label: 'Web', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200' },
    { id: 'cloud', label: 'Cloud/IT', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200' },
    { id: 'ai', label: 'AI', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200' },
    { id: 'security', label: 'Security', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' },
    { id: 'soft', label: 'Soft Skills', color: 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200' },
  ];
  const [activeGroup, setActiveGroup] = useState('all');
  // NEW CODE - TESTING: Spotlight glow state for About title card
  const titleCardRef = useRef<HTMLDivElement>(null);
  const [titleSpotlightPos, setTitleSpotlightPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [titleSpotlightOpacity, setTitleSpotlightOpacity] = useState(0);
  const bgColorCtx = useContext(BackgroundColorContext);
  const [titleSpotlightColor, setTitleSpotlightColor] = useState('rgba(255,255,255,0.22)');
  const [titleInnerGlowColor, setTitleInnerGlowColor] = useState('rgba(255,255,255,0.15)');
  // NEW: per-side inner glow colors
  const [titleInnerGlowTop, setTitleInnerGlowTop] = useState('rgba(255,255,255,0.22)');
  const [titleInnerGlowRight, setTitleInnerGlowRight] = useState('rgba(255,255,255,0.22)');
  const [titleInnerGlowBottom, setTitleInnerGlowBottom] = useState('rgba(255,255,255,0.22)');
  const [titleInnerGlowLeft, setTitleInnerGlowLeft] = useState('rgba(255,255,255,0.22)');
  // Helper: compute perceived luminance to decide when to keep white
  const getLuminance = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  // NEW CODE - TESTING: live sampling while hovered
  const hoverRAF = useRef<number | null>(null);
  const isHoveringRef = useRef(false);
  const sampleSpotlightColor = useCallback(() => {
    if (!titleCardRef.current) return;
    const rect = titleCardRef.current.getBoundingClientRect();
    const windowX = rect.left + titleSpotlightPos.x;
    const windowY = rect.top + titleSpotlightPos.y;
    let colorStr: string | null = null;
    if (bgColorCtx && typeof (bgColorCtx as any).getBackgroundColorAt === 'function') {
      colorStr = (bgColorCtx as any).getBackgroundColorAt(windowX, windowY) as string;
    } else if (typeof (window as any).__getBackgroundColorAt === 'function') {
      colorStr = (window as any).__getBackgroundColorAt(windowX, windowY) as string;
    }
    if (colorStr) {
      const match = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        const r = parseInt(match[1], 10);
        const g = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);
        // Update inner glow color directly from sampled RGB
        setTitleInnerGlowColor(`rgba(${r},${g},${b},0.35)`);
      }
    }
  }, [bgColorCtx, titleSpotlightPos]);
  const startHoverSampling = useCallback(() => {
    if (hoverRAF.current) return;
    isHoveringRef.current = true;
    const loop = () => {
      if (!isHoveringRef.current) { hoverRAF.current = null; return; }
      sampleSpotlightColor();
      hoverRAF.current = requestAnimationFrame(loop);
    };
    hoverRAF.current = requestAnimationFrame(loop);
  }, [sampleSpotlightColor]);
  const stopHoverSampling = useCallback(() => {
    isHoveringRef.current = false;
    if (hoverRAF.current) {
      cancelAnimationFrame(hoverRAF.current);
      hoverRAF.current = null;
    }
  }, []);
  useEffect(() => {
    return () => stopHoverSampling();
  }, [stopHoverSampling]);

  // NEW CODE - TESTING: Always-on inner glow color sampling at each side (while section is in view)
  const innerGlowRAF = useRef<number | null>(null);
  const sampleInnerGlowEdges = useCallback(() => {
    if (!titleCardRef.current) return;
    const rect = titleCardRef.current.getBoundingClientRect();
    const inset = 8; // sample slightly inside the edge
    const samples = {
      top: { x: rect.left + rect.width / 2, y: rect.top + inset },
      right: { x: rect.right - inset, y: rect.top + rect.height / 2 },
      bottom: { x: rect.left + rect.width / 2, y: rect.bottom - inset },
      left: { x: rect.left + inset, y: rect.top + rect.height / 2 },
    };
    function readColor(x: number, y: number): string | null {
      if (bgColorCtx && typeof (bgColorCtx as any).getBackgroundColorAt === 'function') {
        return (bgColorCtx as any).getBackgroundColorAt(x, y) as string;
      }
      if (typeof (window as any).__getBackgroundColorAt === 'function') {
        return (window as any).__getBackgroundColorAt(x, y) as string;
      }
      return null;
    }
    const parse = (str: string | null): [number, number, number] | null => {
      if (!str) return null;
      const m = str.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!m) return null;
      return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
    };
    const t = parse(readColor(samples.top.x, samples.top.y));
    const r = parse(readColor(samples.right.x, samples.right.y));
    const b = parse(readColor(samples.bottom.x, samples.bottom.y));
    const l = parse(readColor(samples.left.x, samples.left.y));
    if (t) setTitleInnerGlowTop(`rgba(${t[0]},${t[1]},${t[2]},0.22)`);
    if (r) setTitleInnerGlowRight(`rgba(${r[0]},${r[1]},${r[2]},0.22)`);
    if (b) setTitleInnerGlowBottom(`rgba(${b[0]},${b[1]},${b[2]},0.22)`);
    if (l) setTitleInnerGlowLeft(`rgba(${l[0]},${l[1]},${l[2]},0.22)`);
  }, [bgColorCtx]);
  const startInnerGlowLoop = useCallback(() => {
    if (innerGlowRAF.current) return;
    const loop = () => {
      sampleInnerGlowEdges();
      innerGlowRAF.current = requestAnimationFrame(loop);
    };
    innerGlowRAF.current = requestAnimationFrame(loop);
  }, [sampleInnerGlowEdges]);
  const stopInnerGlowLoop = useCallback(() => {
    if (innerGlowRAF.current) {
      cancelAnimationFrame(innerGlowRAF.current);
      innerGlowRAF.current = null;
    }
  }, []);
  useEffect(() => {
    if (inView) startInnerGlowLoop(); else stopInnerGlowLoop();
    return () => stopInnerGlowLoop();
  }, [inView, startInnerGlowLoop, stopInnerGlowLoop]);
  const handleTitleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!titleCardRef.current) return;
    const rect = titleCardRef.current.getBoundingClientRect();
    setTitleSpotlightPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    // Sample background color from global gradient and tint spotlight
    let colorStr: string | null = null;
    if (bgColorCtx && typeof (bgColorCtx as any).getBackgroundColorAt === 'function') {
      colorStr = (bgColorCtx as any).getBackgroundColorAt(e.clientX, e.clientY) as string;
    } else if (typeof (window as any).__getBackgroundColorAt === 'function') {
      colorStr = (window as any).__getBackgroundColorAt(e.clientX, e.clientY) as string;
    }
    if (colorStr) {
      const match = colorStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        const r = parseInt(match[1], 10);
        const g = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);
        // # OLD CODE - KEEP UNTIL CONFIRMED WORKING (spotlight used sampled color)
        // setTitleSpotlightColor(`rgba(${r},${g},${b},0.65)`);
        // # NEW CODE - TESTING: spotlight remains white; use sampled color for inner glow
        setTitleInnerGlowColor(`rgba(${r},${g},${b},0.35)`);
      } else {
        setTitleInnerGlowColor('rgba(255,255,255,0.25)');
      }
    }
  };
  const skillsData = [
    // Automation & Scripting
    { name: 'PowerShell', group: 'automation', featured: true },
    { name: 'Automation Scripting', group: 'automation', featured: true },
    { name: 'RMM Migration', group: 'automation' },
    { name: 'Task Scheduling', group: 'automation' },
    { name: 'Scripting for System Health', group: 'automation', featured: true },
    { name: 'File Corruption Repair', group: 'automation', featured: true },
    { name: 'Log Data Gathering & Parsing', group: 'automation' },
    // DevOps & Infrastructure
    { name: 'Unraid (NAS)', group: 'devops', featured: true },
    { name: 'Docker', group: 'devops', featured: true },
    { name: 'Reverse Proxy', group: 'devops' },
    { name: 'SSL Certificate Management', group: 'devops' },
    { name: 'Web Server Hosting', group: 'devops' },
    { name: 'Advanced Storage/Usage Metrics', group: 'devops' },
    { name: 'Hardware/Warranty Info', group: 'devops' },
    // Web & App Development
    { name: 'React', group: 'web', featured: true },
    { name: 'HTML/CSS/JavaScript', group: 'web' },
    { name: 'Flutter', group: 'web' },
    { name: 'Web Design', group: 'web' },
    { name: 'SEO', group: 'web' },
    { name: 'Brand Messaging', group: 'web' },
    { name: 'Wix', group: 'web', featured: true },
    { name: 'Tailwind CSS', group: 'web', featured: true },
    // Cloud & IT
    { name: 'Azure AD', group: 'cloud' },
    { name: 'ConnectWise Automate', group: 'cloud', featured: true },
    { name: 'Datto RMM', group: 'cloud', featured: true },
    { name: 'ConnectWise Manage', group: 'cloud' },
    { name: 'Datto BMS', group: 'cloud' },
    { name: 'System Administration', group: 'cloud', featured: true },
    { name: 'Network Setup/Establishment', group: 'cloud' },
    { name: 'Hardware Troubleshooting', group: 'cloud' },
    { name: 'Macintosh/Apple Hardware Support', group: 'cloud' },
    { name: 'Preventive Maintenance', group: 'cloud', featured: true },
    { name: 'Diagnostic Software & Test Equipment', group: 'cloud' },
    // AI & Emerging Tech
    { name: 'AI Integration', group: 'ai', featured: true },
    { name: 'Prototyping with AI Tools', group: 'ai' },
    { name: 'Local LLMs', group: 'ai', featured: true },
    { name: 'Open-Source AI Models', group: 'ai' },
    // Security
    { name: 'Vulnerability Assessment', group: 'security', featured: true },
    { name: 'Malware Detection & Removal', group: 'security' },
    { name: 'System Hardening', group: 'security' },
    // Soft Skills
    { name: 'Adaptability', group: 'soft', featured: true },
    { name: 'Problem Solving', group: 'soft', featured: true },
    { name: 'Resourcefulness', group: 'soft' },
    { name: 'Communication', group: 'soft', featured: true },
    { name: 'Client Support & Consulting', group: 'soft' },
    { name: 'User Education & Guidance', group: 'soft', featured: true },
    { name: 'Community IT Support', group: 'soft' },
    { name: 'Ticketing Systems', group: 'soft', featured: true },
    { name: 'Technical Documentation', group: 'soft' },
    { name: 'Open-Source Contribution', group: 'soft' },
  ];

  return (
    <>
      {/* Unified background container for all three sections (gradient and overlay now provided by wrapper) */}
      <div className="relative overflow-hidden bg-transparent">
        
        {/* About Me Section */}
        <section id="about" ref={ref} className="section-padding relative z-10 pointer-events-none">
          {ENABLE_ABOUT_GLASS_OVERLAY ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
                className="text-center mb-16 bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 dark:border-dark-700/40"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-4">
                  About Me
                </h2>
                <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
                  Adaptable technologist, creative problem-solver, and lifelong learner—driven to bridge gaps, empower others, and thrive at the intersection of technology and real-world impact.
                </p>
              </motion.div>

              {/* Alternating Narrative Rows */}
              <div className="space-y-16">
                {/* Row 1: Adaptability & Resourcefulness */}
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <motion.div
                    initial={{ opacity: 0, x: -60 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="md:w-1/2"
                  >
                    <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-300 mb-2">Adaptability & Resourcefulness</h3>
                    <p className="text-lg text-secondary-600 dark:text-secondary-300 leading-relaxed">
                      I've come to see adaptability not just as a strength, but as an inevitable necessity in today's fast-paced world. If I were to describe my approach to work and problem-solving, I'd liken it to being a Swiss Army knife—versatile, resourceful, and always ready to reconfigure myself based on the challenge at hand.
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 60 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="md:w-1/2 flex justify-center"
                  >
                    <span
                      /* # OLD CODE - KEEP UNTIL CONFIRMED WORKING (no glow)
                      className="w-28 h-28 flex items-center justify-center rounded-lg bg-primary-100/50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-4xl shadow-md"
                      */
                      className="w-28 h-28 flex items-center justify-center rounded-lg bg-primary-100/50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-4xl shadow-lg border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20 hover:shadow-xl"
                    >
                      <PocketKnife className="w-16 h-16" />
                    </span>
                  </motion.div>
                </div>

                {/* Row 2: Framing Problems & Learning */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                  <motion.div
                    initial={{ opacity: 0, x: 60 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="md:w-1/2"
                  >
                    <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-300 mb-2">Framing Problems & Learning</h3>
                    <p className="text-lg text-secondary-600 dark:text-secondary-300 leading-relaxed">
                      I've honed my ability to identify the right resources and ask the right questions to accomplish a task or reach a goal. In an age where technology evolves rapidly, knowing how to frame a problem has become just as crucial as solving it.
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -60 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="md:w-1/2 flex justify-center"
                  >
                    <span
                      /* # OLD CODE - KEEP UNTIL CONFIRMED WORKING (no glow)
                      className="w-28 h-28 flex items-center justify-center rounded-lg bg-white/50 dark:bg-dark-800/40 text-secondary-700 dark:text-secondary-300 text-4xl shadow-md"
                      */
                      className="w-28 h-28 flex items-center justify-center rounded-lg bg-white/50 dark:bg-dark-800/40 text-secondary-700 dark:text-secondary-300 text-4xl shadow-lg border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20 hover:shadow-xl hover:bg-white/55 dark:hover:bg-dark-800/45"
                    >
                      <HelpCircle className="w-16 h-16" />
                    </span>
                  </motion.div>
                </div>

                {/* Row 3: Embracing AI & Emerging Tools */}
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <motion.div
                    initial={{ opacity: 0, x: -60 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="md:w-1/2"
                  >
                    <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-300 mb-2">Embracing AI & Emerging Tools</h3>
                    <p className="text-lg text-secondary-600 dark:text-secondary-300 leading-relaxed">
                      I leverage emerging tools—especially AI—to enhance both the effectiveness and efficiency of my work. Whether it's automating repetitive tasks, prototyping new ideas quickly, or exploring unfamiliar technologies, I make it a priority to stay adaptable and curious.
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 60 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="md:w-1/2 flex justify-center"
                  >
                    <span
                      /* # OLD CODE - KEEP UNTIL CONFIRMED WORKING (no glow)
                      className="w-28 h-28 flex items-center justify-center rounded-lg bg-primary-100/50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-4xl shadow-md"
                      */
                      className="w-28 h-28 flex items-center justify-center rounded-lg bg-primary-100/50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-4xl shadow-lg border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20 hover:shadow-xl"
                    >
                      <BrainCircuit className="w-16 h-16" />
                    </span>
                  </motion.div>
                </div>

                {/* Row 4: Breadth & Intentional Learning */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                  <motion.div
                    initial={{ opacity: 0, x: 60 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="md:w-1/2"
                  >
                    <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-300 mb-2">Breadth & Intentional Learning</h3>
                    <p className="text-lg text-secondary-600 dark:text-secondary-300 leading-relaxed">
                      While some people thrive through deep, rigid specialization, I believe there's immense value in being able to extend beyond any single domain. My strength lies in the ability to dynamically adapt, to dive into new subjects—even those I wouldn't claim deep expertise in—and gain enough working knowledge to push a project forward or reach an otherwise inaccessible goal.
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -60 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="md:w-1/2 flex justify-center"
                  >
                    <span
                      /* # OLD CODE - KEEP UNTIL CONFIRMED WORKING (no glow)
                      className="w-28 h-28 flex items-center justify-center rounded-lg bg-white/50 dark:bg-dark-800/40 text-secondary-700 dark:text-secondary-300 text-4xl shadow-md"
                      */
                      className="w-28 h-28 flex items-center justify-center rounded-lg bg-white/50 dark:bg-dark-800/40 text-secondary-700 dark:text-secondary-300 text-4xl shadow-lg border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20 hover:shadow-xl hover:bg-white/55 dark:hover:bg-dark-800/45"
                    >
                      <Book className="w-16 h-16" />
                    </span>
                  </motion.div>
                </div>

                {/* Row 5: Proof in Practice (React anecdote) */}
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <motion.div
                    initial={{ opacity: 0, x: -60 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="md:w-1/2"
                  >
                    <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-300 mb-2">Proof in Practice</h3>
                    <p className="text-lg text-secondary-600 dark:text-secondary-300 leading-relaxed">
                      Take React, for example. Until recently, I had never touched it. But through focused learning, experimentation, and leveraging resources—including AI tools—I was able to build functioning projects that I'm proud of. If you want proof of this adaptive approach in action, just look at this site and my other React-based work.
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 60 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="md:w-1/2 flex justify-center"
                  >
                    <span
                      /* # OLD CODE - KEEP UNTIL CONFIRMED WORKING (no glow)
                      className="w-28 h-28 flex items-center justify-center rounded-lg bg-primary-100/50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-4xl shadow-md"
                      */
                      className="w-28 h-28 flex items-center justify-center rounded-lg bg-primary-100/50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-4xl shadow-lg border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20 hover:shadow-xl"
                    >
                      <Eye className="w-16 h-16" />
                    </span>
                  </motion.div>
                </div>

                {/* Row 6: Philosophy */}
                <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                  <motion.div
                    initial={{ opacity: 0, x: 60 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="md:w-1/2"
                  >
                    <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-300 mb-2">Philosophy</h3>
                    <p className="text-lg text-secondary-600 dark:text-secondary-300 leading-relaxed">
                      In today's world, we don't just need specialists—we need people who can co-create and co-evolve alongside technology. The future belongs to those who can fluidly shift, integrate, and collaborate—not just with teams, but with the intelligent systems now becoming part of our creative and operational workflows.
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -60 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="md:w-1/2 flex justify-center"
                  >
                    <span
                      /* # OLD CODE - KEEP UNTIL CONFIRMED WORKING (no glow)
                      className="w-28 h-28 flex items-center justify-center rounded-lg bg-white/50 dark:bg-dark-800/40 text-secondary-700 dark:text-secondary-300 text-4xl shadow-md"
                      */
                      className="w-28 h-28 flex items-center justify-center rounded-lg bg-white/50 dark:bg-dark-800/40 text-secondary-700 dark:text-secondary-300 text-4xl shadow-lg border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20 hover:shadow-xl hover:bg-white/55 dark:hover:bg-dark-800/45"
                    >
                      <Globe className="w-16 h-16" />
                    </span>
                  </motion.div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="container-max">
                {/* # OLD CODE - KEEP UNTIL CONFIRMED WORKING
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8 }}
                  className="text-center mb-16 bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 dark:border-dark-700/40"
                >
                  <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-4">
                    About Me
                  </h2>
                  <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
                    Adaptable technologist, creative problem-solver, and lifelong learner—driven to bridge gaps, empower others, and thrive at the intersection of technology and real-world impact.
                  </p>
                </motion.div>
                */}
                {/* # NEW CODE - TESTING */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8 }}
                  className="text-center mb-16"
                >
                  <div className="max-w-4xl mx-auto">
                    {/* # OLD CODE - KEEP UNTIL CONFIRMED WORKING (GlassCard variant) */}
                    {/**
                    <GlassCard className="rounded-2xl">
                      <div className="rounded-2xl p-8">
                        <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-4">
                          About Me
                        </h2>
                        <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
                          Adaptable technologist, creative problem-solver, and lifelong learner—driven to bridge gaps, empower others, and thrive at the intersection of technology and real-world impact.
                        </p>
                      </div>
                    </GlassCard>
                    */}
                    {/* # NEW CODE - TESTING: Badge-themed container */}
                    {/* # OLD CODE - KEEP UNTIL CONFIRMED WORKING (no glow)
                    <div className="bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 dark:border-dark-700/40 pointer-events-auto hover:shadow-xl hover:bg-white/55 dark:hover:bg-dark-800/45 transition-all duration-300">
                    */}
                    {/* # OLD CODE - KEEP UNTIL CONFIRMED WORKING (no spotlight) */}
                    {/**
                    <div className="bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 dark:border-dark-700/40 pointer-events-auto hover:shadow-xl hover:bg-white/55 dark:hover:bg-dark-800/45 transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20">
                      <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-4">About Me</h2>
                      <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">Adaptable technologist, creative problem-solver, and lifelong learner—driven to bridge gaps, empower others, and thrive at the intersection of technology and real-world impact.</p>
                    </div>
                    */}
                    {/* # NEW CODE - TESTING: Spotlight hover effect */}
                    <SpotlightGlow className="bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 dark:border-dark-700/40 pointer-events-auto hover:shadow-xl hover:bg-white/55 dark:hover:bg-dark-800/45 transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20">
                      <h2 className="text-4xl md:text-5xl font-bold text-secondary-900 dark:text-white mb-4">About Me</h2>
                      <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
                        Adaptable technologist, creative problem-solver, and lifelong learner—driven to bridge gaps, empower others, and thrive at the intersection of technology and real-world impact.
                      </p>
                    </SpotlightGlow>
                  </div>
                </motion.div>

                {/* Alternating Narrative Rows */}
                <div className="space-y-16">
                  {/* Row 1: Adaptability & Resourcefulness */}
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <motion.div
                      initial={{ opacity: 0, x: -60 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="md:w-1/2"
                    >
                      <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-300 mb-2">Adaptability & Resourcefulness</h3>
                      <p className="text-lg text-secondary-600 dark:text-secondary-300 leading-relaxed">
                        I've come to see adaptability not just as a strength, but as an inevitable necessity in today's fast-paced world. If I were to describe my approach to work and problem-solving, I'd liken it to being a Swiss Army knife—versatile, resourceful, and always ready to reconfigure myself based on the challenge at hand.
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 60 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="md:w-1/2 flex justify-center pointer-events-auto"
                    >
                      <SpotlightGlow className="w-28 h-28 flex items-center justify-center rounded-lg bg-primary-100/50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-4xl shadow-lg border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20 hover:shadow-xl">
                        <PocketKnife className="w-16 h-16" />
                      </SpotlightGlow>
                    </motion.div>
                  </div>

                  {/* Row 2: Framing Problems & Learning */}
                  <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                    <motion.div
                      initial={{ opacity: 0, x: 60 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="md:w-1/2"
                    >
                      <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-300 mb-2">Framing Problems & Learning</h3>
                      <p className="text-lg text-secondary-600 dark:text-secondary-300 leading-relaxed">
                        I've honed my ability to identify the right resources and ask the right questions to accomplish a task or reach a goal. In an age where technology evolves rapidly, knowing how to frame a problem has become just as crucial as solving it.
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -60 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="md:w-1/2 flex justify-center pointer-events-auto"
                    >
                      <SpotlightGlow className="w-28 h-28 flex items-center justify-center rounded-lg bg-white/50 dark:bg-dark-800/40 text-secondary-700 dark:text-secondary-300 text-4xl shadow-lg border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20 hover:shadow-xl hover:bg-white/55 dark:hover:bg-dark-800/45">
                        <HelpCircle className="w-16 h-16" />
                      </SpotlightGlow>
                    </motion.div>
                  </div>

                  {/* Row 3: Embracing AI & Emerging Tools */}
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <motion.div
                      initial={{ opacity: 0, x: -60 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="md:w-1/2"
                    >
                      <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-300 mb-2">Embracing AI & Emerging Tools</h3>
                      <p className="text-lg text-secondary-600 dark:text-secondary-300 leading-relaxed">
                        I leverage emerging tools—especially AI—to enhance both the effectiveness and efficiency of my work. Whether it's automating repetitive tasks, prototyping new ideas quickly, or exploring unfamiliar technologies, I make it a priority to stay adaptable and curious.
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 60 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="md:w-1/2 flex justify-center pointer-events-auto"
                    >
                      <SpotlightGlow className="w-28 h-28 flex items-center justify-center rounded-lg bg-primary-100/50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-4xl shadow-lg border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15 pointer-events-auto backdrop-blur-sm hover:ring-white/50 dark:hover:ring-white/20 hover:shadow-xl">
                        <BrainCircuit className="w-16 h-16" />
                      </SpotlightGlow>
                    </motion.div>
                  </div>

                  {/* Row 4: Breadth & Intentional Learning */}
                  <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                    <motion.div
                      initial={{ opacity: 0, x: 60 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="md:w-1/2"
                    >
                      <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-300 mb-2">Breadth & Intentional Learning</h3>
                      <p className="text-lg text-secondary-600 dark:text-secondary-300 leading-relaxed">
                        While some people thrive through deep, rigid specialization, I believe there's immense value in being able to extend beyond any single domain. My strength lies in the ability to dynamically adapt, to dive into new subjects—even those I wouldn't claim deep expertise in—and gain enough working knowledge to push a project forward or reach an otherwise inaccessible goal.
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -60 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="md:w-1/2 flex justify-center pointer-events-auto"
                    >
                      <SpotlightGlow className="w-28 h-28 flex items-center justify-center rounded-lg bg-white/50 dark:bg-dark-800/40 text-secondary-700 dark:text-secondary-300 text-4xl shadow-lg border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20 hover:shadow-xl hover:bg-white/55 dark:hover:bg-dark-800/45">
                        <Book className="w-16 h-16" />
                      </SpotlightGlow>
                    </motion.div>
                  </div>

                  {/* Row 5: Proof in Practice (React anecdote) */}
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <motion.div
                      initial={{ opacity: 0, x: -60 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="md:w-1/2"
                    >
                      <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-300 mb-2">Proof in Practice</h3>
                      <p className="text-lg text-secondary-600 dark:text-secondary-300 leading-relaxed">
                        Take React, for example. Until recently, I had never touched it. But through focused learning, experimentation, and leveraging resources—including AI tools—I was able to build functioning projects that I'm proud of. If you want proof of this adaptive approach in action, just look at this site and my other React-based work.
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: 60 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="md:w-1/2 flex justify-center"
                    >
                      <SpotlightGlow className="w-28 h-28 flex items-center justify-center rounded-lg bg-primary-100/50 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-4xl shadow-lg border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20 hover:shadow-xl">
                        <Eye className="w-16 h-16" />
                      </SpotlightGlow>
                    </motion.div>
                  </div>

                  {/* Row 6: Philosophy */}
                  <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                    <motion.div
                      initial={{ opacity: 0, x: 60 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.8, delay: 0.1 }}
                      className="md:w-1/2"
                    >
                      <h3 className="text-2xl font-bold text-primary-700 dark:text-primary-300 mb-2">Philosophy</h3>
                      <p className="text-lg text-secondary-600 dark:text-secondary-300 leading-relaxed">
                        In today's world, we don't just need specialists—we need people who can co-create and co-evolve alongside technology. The future belongs to those who can fluidly shift, integrate, and collaborate—not just with teams, but with the intelligent systems now becoming part of our creative and operational workflows.
                      </p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -60 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="md:w-1/2 flex justify-center"
                    >
                      <SpotlightGlow className="w-28 h-28 flex items-center justify-center rounded-lg bg-white/50 dark:bg-dark-800/40 text-secondary-700 dark:text-secondary-300 text-4xl shadow-lg border border-white/30 dark:border-dark-700/40 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20 hover:shadow-xl hover:bg-white/55 dark:hover:bg-dark-800/45">
                        <Globe className="w-16 h-16" />
                      </SpotlightGlow>
                    </motion.div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>

              {/* Skills & Technologies Section */}
        <section id="skills" ref={skillsRef} className="section-padding relative z-10 pointer-events-none">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={skillsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mt-12 mb-6"
          >
            <h3 className="text-3xl font-bold text-secondary-900 dark:text-white text-center mb-8">
              Skills & Technologies
            </h3>
            {/* Semi-transparent container for better readability */}
            {/* # OLD CODE - KEEP UNTIL CONFIRMED WORKING (no glow)
            <div className="bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 dark:border-dark-700/40 pointer-events-auto hover:shadow-xl hover:bg-white/55 dark:hover:bg-dark-800/45 transition-all duration-300">
            */}
            {/* # OLD CODE - KEEP UNTIL CONFIRMED WORKING (no spotlight wrapper)
            <div className="bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 dark:border-dark-700/40 pointer-events-auto hover:shadow-xl hover:bg-white/55 dark:hover:bg-dark-800/45 transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20">
            */}
            <SpotlightGlow className="bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 dark:border-dark-700/40 pointer-events-auto hover:shadow-xl hover:bg-white/55 dark:hover:bg-dark-800/45 transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20">
              {/* Legend/Filter Bar */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {skillGroups.map((g) => {
                  let isActive = false;
                  if (activeGroup === 'all') {
                    isActive = true;
                  } else if (activeGroup === 'featured') {
                    isActive = g.id === 'featured';
                  } else {
                    isActive = g.id === activeGroup;
                  }
                  return (
                    <button
                      key={g.id}
                      onClick={() => setActiveGroup(g.id)}
                      className={`px-4 py-2 rounded-full font-medium transition-all duration-200 border-2 focus:outline-none focus:ring-2 focus:ring-primary-400 pointer-events-auto ${g.color} ${activeGroup === g.id ? 'border-primary-600 ring-2 ring-primary-200' : 'border-transparent opacity-90 hover:opacity-100 hover:scale-105'} ${isActive ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {skillsData.map((skill) => {
                  const groupColor = skillGroups.find((g) => g.id === skill.group)?.color || '';
                  let ringClass = '';
                  if (skill.featured) {
                    ringClass = 'ring-1 ring-primary-300';
                  }
                  let isActive = true;
                  if (activeGroup === 'featured') {
                    isActive = !!skill.featured;
                  } else if (activeGroup !== 'all') {
                    isActive = activeGroup === skill.group;
                  }
                  return (
                    <span
                      key={skill.name}
                      className={`px-4 py-2 rounded-full shadow-sm font-medium !font-normal text-base transition-all duration-200 ${groupColor} ${ringClass} ${isActive ? 'opacity-100 scale-100 hover:scale-105 hover:shadow-md' : 'opacity-40 scale-95 pointer-events-none'}`}
                    >
                      {skill.name}
                    </span>
                  );
                })}
              </div>
            </SpotlightGlow>
          </motion.div>
        </div>
      </section>

              {/* What Drives Me Section */}
        <section id="values" ref={valuesRef} className="section-padding relative z-10 pointer-events-none">
        <div className="container-max">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={valuesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-0"
          >
            <h3 className="text-3xl font-bold text-secondary-900 dark:text-white text-center mb-12">
              What Drives Me
            </h3>
            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 1 + index * 0.2 }}
                  /* # OLD CODE - KEEP UNTIL CONFIRMED WORKING (no glow)
                  className="text-center p-6 bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 dark:border-dark-700/40 pointer-events-auto hover:shadow-xl hover:bg-white/55 dark:hover:bg-dark-800/45 transition-all duration-300"
                  */
                  className="pointer-events-auto h-full"
                >
                  <SpotlightGlow className="text-center p-6 bg-white/50 dark:bg-dark-800/40 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 dark:border-dark-700/40 hover:shadow-xl hover:bg-white/55 dark:hover:bg-dark-800/45 transition-all duration-300 ring-1 ring-white/40 dark:ring-white/15 hover:ring-white/50 dark:hover:ring-white/20 h-full flex flex-col">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mx-auto mb-4 text-primary-600 dark:text-primary-400">
                      {value.icon}
                    </div>
                    <h4 className="text-xl font-semibold text-secondary-900 dark:text-white mb-3">
                      {value.title}
                    </h4>
                    <p className="text-secondary-600 dark:text-secondary-300 flex-1">
                      {value.description}
                    </p>
                  </SpotlightGlow>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
        </div>
      </>
    );
  };

export default About; 