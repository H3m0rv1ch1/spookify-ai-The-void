---
inclusion: conditional
fileMatchPattern: '**/minigames/*.tsx'
---

# Minigame Development Guidelines

## Architecture
Each minigame is a self-contained React component that follows this pattern:
- Receives `config` prop with difficulty settings
- Receives `onComplete` callback for success
- Receives `onFail` callback for failure (PurgePhase only)
- Manages its own internal state
- Returns JSX with consistent styling

## Difficulty Scaling
Minigames have 3 difficulty levels controlled by `corruptionConstants.ts`:
- **Level 1**: Tutorial difficulty (easier thresholds, more time)
- **Level 2**: Normal difficulty (balanced challenge)
- **Level 3**: Hard difficulty (tight timing, precise matching)

## Visual Consistency
All minigames share these design elements:
- Corner brackets for tech aesthetic
- Neon red (`#FF2A2A`) for active/danger states
- White/ash for neutral states
- Green for success states
- Scanline effects and glitch animations
- Responsive design (mobile + desktop)

## Performance Requirements
- Maintain 60fps during gameplay
- Use `requestAnimationFrame` for smooth animations
- Debounce expensive calculations
- Clean up intervals/timeouts in useEffect cleanup

## User Feedback
Provide clear visual feedback for:
- Current progress/state
- Success conditions
- Failure warnings
- Interactive elements (hover states)
- Completion animations

## Testing Checklist
- [ ] Works on mobile (touch events)
- [ ] Works on desktop (mouse events)
- [ ] Difficulty scales appropriately
- [ ] No memory leaks (cleanup effects)
- [ ] Accessible (keyboard navigation where applicable)
- [ ] Clear instructions displayed
