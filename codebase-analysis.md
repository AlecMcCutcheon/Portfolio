# Codebase Analysis - LCP Optimization Opportunities

## Critical Issues Identified

### 1. **Font Loading Issues** ❌
**Location**: `public/index.html` lines 126-132
- **Current**: Fonts load via CSS with `font-display: swap` ✓
- **Missing**: No font preloading for critical Inter font weights
- **Impact**: Text waits for font download before rendering
- **Fix**: Add `<link rel="preload">` for Inter font weights used in hero

### 2. **CSS Gradient Text Performance** ❌
**Location**: `src/index.css` lines 43-45
```css
.gradient-text {
  @apply bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent;
}
```
- **Issue**: `background-clip: text` with `color: transparent` creates complex rendering
- **Impact**: Browser must create additional paint layers for gradient text
- **Fix**: Provide solid color fallback or simplify gradient

### 3. **Framer Motion Blocking LCP** ❌
**Location**: `src/components/Hero.tsx` lines 43-49
```jsx
<motion.h1 {...getOptimizedVariants(0.6, 0)} className="hero-title">
  Hi, I'm <span className="gradient-text">Alec McCutcheon</span>
</motion.h1>
```
- **Issue**: Hero title (LCP element) wrapped in Framer Motion
- **Impact**: Text rendering delayed by animation initialization
- **Fix**: Render static text first, then apply animations

### 4. **Critical CSS Missing Text Styles** ❌
**Location**: `public/index.html` lines 136-247
- **Current**: Critical CSS includes basic layout but missing text-specific styles
- **Missing**: Hero title styles, gradient text styles, font loading hints
- **Impact**: Text renders unstyled until full CSS loads
- **Fix**: Add critical text styles to inline CSS

### 5. **Complex Subtitle Rendering** ❌
**Location**: `src/components/Hero.tsx` lines 52-70
- **Issue**: Complex backdrop-blur and multiple CSS classes on subtitle elements
- **Impact**: Each subtitle badge requires complex rendering calculations
- **Fix**: Simplify styling or defer non-critical visual effects

## Specific Optimization Plan

### Phase 1: Font Loading Optimization
1. Add font preload for Inter font weights (400, 500, 600, 700)
2. Ensure font-display: swap is properly configured
3. Add font loading fallbacks in critical CSS

### Phase 2: Text Rendering Optimization
1. Move critical text outside of Framer Motion wrappers
2. Add solid color fallback for gradient text
3. Include text styles in critical CSS

### Phase 3: Animation Optimization
1. Defer animations until after text is visible
2. Use CSS animations instead of JavaScript where possible
3. Implement progressive enhancement for animations

### Phase 4: CSS Optimization
1. Simplify complex backdrop-blur effects
2. Reduce paint complexity in subtitle elements
3. Optimize critical rendering path

## Expected Impact
- **LCP**: Reduce from 8.0s to <2.5s
- **FCP**: Maintain current 1.2s performance
- **CLS**: Keep at 0 (perfect score)
- **Overall Score**: Improve from 61 to 80+

## Implementation Priority
1. **High Priority**: Font preloading and critical text styles
2. **Medium Priority**: Gradient text optimization
3. **Low Priority**: Animation deferral and CSS simplification
