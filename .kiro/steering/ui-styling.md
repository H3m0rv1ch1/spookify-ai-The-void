---
inclusion: conditional
fileMatchPattern: '**/*.tsx'
---

# UI Styling Guidelines

## Cyberpunk Horror Aesthetic
This app combines cyberpunk tech aesthetics with horror themes. Every UI element should feel:
- **Glitchy**: Use subtle glitch effects and scanlines
- **Technical**: Corner brackets, monospace fonts, system-like interfaces
- **Ominous**: Dark backgrounds, red accents, pulsing danger states
- **Polished**: Smooth animations, attention to micro-interactions

## Component Patterns

### Cards/Panels
```tsx
<div className="bg-black/80 border-2 border-white/20 p-4">
  {/* Corner brackets */}
  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-white"></div>
  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-white"></div>
  {/* Content */}
</div>
```

### Active/Danger States
```tsx
className="border-neon-red shadow-[0_0_20px_rgba(255,42,42,0.5)] animate-pulse"
```

### Text Hierarchy
- **Headers**: `font-display text-white` (Syne font)
- **Body**: `font-tech text-ash` (Space Grotesk)
- **Labels**: `font-tech text-[10px] uppercase tracking-wider text-ash/60`
- **Danger**: `text-neon-red`

### Buttons
Use the `SpookyButton` component with variants:
- `primary`: Standard action
- `ritual`: Important/dramatic actions
- `ghost`: Secondary actions

### Animations
- **Fade in**: `animate-[fadeIn_0.5s_ease-out]`
- **Scale in**: `animate-[scaleIn_0.5s_ease-out]`
- **Slide up**: `animate-[slideUp_0.5s_ease-out]`
- **Pulse**: `animate-pulse` (for active states)
- **Glitch**: `animate-glitch` (for corruption effects)

## Responsive Design
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`
- Mobile-first approach
- Test touch interactions on mobile
- Ensure text is readable on small screens

## Accessibility
- Maintain color contrast ratios
- Provide hover states for interactive elements
- Use semantic HTML where possible
- Include ARIA labels for complex interactions
