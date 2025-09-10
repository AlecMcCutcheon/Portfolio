import React from 'react';

export type ProceduralOptions = {
  width?: number;
  height?: number;
  isDark?: boolean; // override theme detection
  lightPalette?: string[];
  darkPalette?: string[];
  // 0: mostly 2-way, 1: mostly 4-way, 2: occasionally 8-way (kaleidoscope)
  mirrorBias?: 0 | 1 | 2;
  // density scalar (0.5 = fewer shapes, 1 = default, 1.5 = more)
  density?: number;
};

export function stableStringify(input: any): string {
  const seen = new WeakSet();
  function normalize(value: any): any {
    if (value && typeof value === 'object') {
      if (seen.has(value)) return null;
      seen.add(value);
      if (Array.isArray(value)) return value.map(normalize);
      const out: Record<string, any> = {};
      for (const key of Object.keys(value).sort()) out[key] = normalize(value[key]);
      return out;
    }
    return value;
  }
  return JSON.stringify(normalize(input));
}

export function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return h >>> 0;
}

export function seededRandom(seed: number) {
  let s = seed >>> 0;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 10000) / 10000;
  };
}

const DEFAULT_LIGHT = [
  'hsl(221, 83%, 53%)', // blue-600
  'hsl(259, 94%, 61%)', // violet-500
  'hsl(280, 83%, 60%)', // purple
  'hsl(199, 89%, 48%)', // sky-500
  'hsl(173, 80%, 40%)', // teal-600
  'hsl(14, 90%, 57%)',  // orange-500
  'hsl(340, 82%, 52%)', // rose-500
  'hsl(234, 14%, 35%)', // slate-600
];
const DEFAULT_DARK = [
  'hsl(221, 83%, 66%)', // blue-400
  'hsl(259, 94%, 70%)', // violet-400
  'hsl(280, 83%, 72%)', // purple-400
  'hsl(199, 95%, 72%)', // sky-400
  'hsl(173, 80%, 65%)', // teal-400
  'hsl(14, 90%, 68%)',  // orange-400
  'hsl(340, 82%, 68%)', // rose-400
  'hsl(234, 14%, 70%)', // slate-300
];

export function generateProceduralImage(seedInput: string, opts: ProceduralOptions = {}): string {
  const width = Math.max(16, Math.floor(opts.width ?? 800));
  const height = Math.max(16, Math.floor(opts.height ?? 480));
  const isDark = opts.isDark ?? (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  const palette = (isDark ? (opts.darkPalette ?? DEFAULT_DARK) : (opts.lightPalette ?? DEFAULT_LIGHT)).slice();

  const seed = hashString(seedInput);
  const rand = seededRandom(seed);
  const idx1 = Math.floor(rand() * palette.length);
  const idx2 = (idx1 + 2 + Math.floor(rand() * (palette.length - 1))) % palette.length;
  const grad1 = palette[idx1];
  const grad2 = palette[idx2];
  const bg = isDark ? 'hsl(222, 47%, 11%)' : 'hsl(210, 20%, 96%)';

  const density = Math.max(0.25, Math.min(2, opts.density ?? 1));
  const qWidth = Math.floor(width / 2);
  const qHeight = Math.floor(height / 2);

  // choose mirror mode
  const r = rand();
  let mirrorMode: 0 | 1 | 2 = 1;
  const bias = opts.mirrorBias ?? 1;
  if (bias === 0) mirrorMode = r < 0.7 ? 0 : r < 0.95 ? 1 : 2;
  else if (bias === 1) mirrorMode = r < 0.6 ? 1 : r < 0.95 ? 0 : 2;
  else mirrorMode = r < 0.5 ? 1 : r < 0.85 ? 2 : 0;

  // circles
  const circles: string[] = [];
  const circleCount = Math.max(1, Math.round((3 + Math.floor(rand() * 3)) * density));
  for (let i = 0; i < circleCount; i++) {
    const cx = Math.floor(rand() * qWidth);
    const cy = Math.floor(rand() * qHeight);
    const r0 = Math.floor((30 + rand() * 80) * (0.9 + rand() * 0.2));
    const colorIdx = Math.floor(rand() * palette.length);
    const fill = palette[(idx1 + colorIdx) % palette.length];
    const opacity = (isDark ? 0.22 : 0.18) + rand() * (isDark ? 0.26 : 0.22);
    circles.push(`<circle cx="${cx}" cy="${cy}" r="${r0}" fill="${fill}" opacity="${opacity.toFixed(2)}" />`);
  }

  // rings
  const rings: string[] = [];
  const ringCount = Math.max(1, Math.round((2 + Math.floor(rand() * 2)) * density));
  for (let i = 0; i < ringCount; i++) {
    const cx = Math.floor(rand() * qWidth);
    const cy = Math.floor(rand() * qHeight);
    const rr = Math.floor(50 + rand() * 120);
    const colorIdx = Math.floor(rand() * palette.length);
    const stroke = palette[(idx2 + colorIdx) % palette.length];
    const strokeOpacity = (isDark ? 0.22 : 0.16) + rand() * 0.14;
    const strokeWidth = 3 + Math.floor(rand() * 2);
    rings.push(`<circle cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="${stroke}" stroke-opacity="${strokeOpacity.toFixed(2)}" stroke-width="${strokeWidth}" />`);
  }

  // rects
  const rects: string[] = [];
  const rectCount = Math.max(1, Math.round((2 + Math.floor(rand() * 3)) * density));
  for (let i = 0; i < rectCount; i++) {
    const w = Math.floor(60 + rand() * 120);
    const h = Math.floor(30 + rand() * 80);
    const x = Math.floor(rand() * Math.max(1, qWidth - w));
    const y = Math.floor(rand() * Math.max(1, qHeight - h));
    const rx = 10 + Math.floor(rand() * 24);
    const angle = Math.floor(rand() * 360);
    const colorIdx = Math.floor(rand() * palette.length);
    const fill = palette[(idx1 + colorIdx * 2) % palette.length];
    const opacity = (isDark ? 0.16 : 0.12) + rand() * 0.10;
    rects.push(`<g transform="rotate(${angle} ${x + w / 2} ${y + h / 2})"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="${fill}" opacity="${opacity.toFixed(2)}" /></g>`);
  }

  // triangles
  const tris: string[] = [];
  const triCount = Math.max(1, Math.round((1 + Math.floor(rand() * 2)) * density));
  for (let i = 0; i < triCount; i++) {
    const x1 = Math.floor(rand() * qWidth), y1 = Math.floor(rand() * qHeight);
    const x2 = Math.floor(rand() * qWidth), y2 = Math.floor(rand() * qHeight);
    const x3 = Math.floor(rand() * qWidth), y3 = Math.floor(rand() * qHeight);
    const colorIdx = Math.floor(rand() * palette.length);
    const fill = palette[(idx2 + colorIdx * 3) % palette.length];
    const opacity = (isDark ? 0.16 : 0.12) + rand() * 0.08;
    tris.push(`<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3}" fill="${fill}" opacity="${opacity.toFixed(2)}" />`);
  }

  // stripes overlay
  const stripes: string[] = [];
  const stripeCount = 12;
  for (let i = 0; i < stripeCount; i++) {
    const y = Math.floor((i / stripeCount) * height);
    const alpha = (isDark ? 0.06 : 0.04) + (i % 2 === 0 ? (isDark ? 0.02 : 0.015) : 0);
    const stripeColor = isDark ? 'white' : 'black';
    stripes.push(`<rect x="0" y="${y}" width="${width}" height="${Math.ceil(height / stripeCount)}" fill="${stripeColor}" opacity="${alpha.toFixed(2)}" />`);
  }

  const baseGroup = [
    `<g filter=\"url(#blurSoft)\">${circles.join('\\n')}</g>`,
    `<g>${rings.join('\\n')}</g>`,
    `<g filter=\"url(#blurMid)\">${rects.join('\\n')}</g>`,
    `<g>${tris.join('\\n')}</g>`
  ].join('');

  const mirrors: string[] = [];
  mirrors.push(baseGroup);
  mirrors.push(`<g transform=\"translate(${width},0) scale(-1,1)\">${baseGroup}</g>`);
  mirrors.push(`<g transform=\"translate(0,${height}) scale(1,-1)\">${baseGroup}</g>`);
  mirrors.push(`<g transform=\"translate(${width},${height}) scale(-1,-1)\">${baseGroup}</g>`);
  if (mirrorMode >= 2) {
    const steps = 3;
    for (let i = 0; i < steps; i++) {
      const angle = (360 / steps) * i + Math.floor(rand() * 15);
      mirrors.push(`<g transform=\"translate(${width / 2},${height / 2}) rotate(${angle}) translate(${-width / 2},${-height / 2})\">${baseGroup}</g>`);
    }
  }

  const svg = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>
  <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"${width}\" height=\"${height}\" viewBox=\"0 0 ${width} ${height}\">\n    <defs>\n      <linearGradient id=\"g1\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\">\n        <stop offset=\"0%\" stop-color=\"${grad1}\" />\n        <stop offset=\"100%\" stop-color=\"${grad2}\" />\n      </linearGradient>\n      <filter id=\"blurSoft\"><feGaussianBlur stdDeviation=\"6\" /></filter>\n      <filter id=\"blurMid\"><feGaussianBlur stdDeviation=\"8\" /></filter>\n    </defs>\n    <rect width=\"100%\" height=\"100%\" fill=\"${bg}\" />\n    <rect width=\"100%\" height=\"100%\" fill=\"url(#g1)\" opacity=\"${isDark ? '0.55' : '0.65'}\" />\n    ${mirrors.join('')}\n    <g opacity=\"0.35\">${stripes.join('\\n')}</g>\n  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export type ProceduralArtImageProps = {
  data: unknown | string;
  width?: number;
  height?: number;
  options?: ProceduralOptions;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
};

export const ProceduralArtImage: React.FC<ProceduralArtImageProps> = ({ data, width = 800, height = 480, options, alt = 'procedural-art', className, style }) => {
  const seed = typeof data === 'string' ? data : stableStringify(data);
  const src = generateProceduralImage(seed, { width, height, ...options });
  return <img src={src} width={width} height={height} alt={alt} className={className} style={style} />;
};

export default ProceduralArtImage;


