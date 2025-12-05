# Mini Games

This folder contains the individual mini game components for the Signal Corruption Game.

## Games (In Order)

### 1. GlyphPhase.tsx - Pattern Recognition (Phase 01) ⭐ FIRST
- **Objective**: Memorize and replicate a sequence of corrupted glyphs
- **Mechanics**: Players must remember the order of symbols shown and click them in the correct sequence
- **Difficulty**: Increases with level (more glyphs, larger grid)

### 2. WaveformPhase.tsx - Signal Calibration (Phase 02)
- **Objective**: Match a target waveform by adjusting frequency, amplitude, and phase
- **Mechanics**: Players use sliders to manipulate wave parameters until they match the target
- **Visual**: Real-time oscilloscope display showing both target and current waveforms

### 3. PurgePhase.tsx - Neural Purge (Phase 03) 🎯 FINAL
- **Objective**: Hold a button to charge a purge sequence while avoiding instability spikes
- **Mechanics**: Players must release the button before hitting red spike markers, then continue
- **Challenge**: Timing and reaction-based gameplay

## Usage

All mini games are exported through `index.ts` and imported into `SignalCorruptionGame.tsx`:

```typescript
import { GlyphPhase, WaveformPhase, PurgePhase } from './minigames';
```

Each game receives:
- `config`: Level configuration from `corruptionConstants.ts`
- `onComplete`: Callback when the game is successfully completed
- `onFail`: Callback when the player fails (GlyphPhase and PurgePhase only)

## Adding New Mini Games

To add a new mini game:

1. Create a new file in this folder (e.g., `NewGamePhase.tsx`)
2. Export the component from `index.ts`
3. Import and use it in `SignalCorruptionGame.tsx`
4. Add configuration in `corruptionConstants.ts` if needed
