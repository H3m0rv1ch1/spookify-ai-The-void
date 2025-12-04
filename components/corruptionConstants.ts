export const GLYPHS = ['⏃', '⎔', '⍜', '⍟', '⎎', '⎅', '⎇', '⎈', '⎌', '⍾', '⍰', '⍞', '⏣', '⏤', '⏚', '⏛'];

export interface LevelConfig {
  level: number;
  // Waveform Tuning
  waveMatchThreshold: number; // e.g. 0.95 for 95%
  // Glyph Decryption
  glyphSequenceLength: number;
  glyphGridSize: number; // e.g. 4 for a 4x4 grid
  // Signal Purge
  purgeDuration: number; // in ms
  purgeSpikes: number;
}

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    waveMatchThreshold: 0.95,
    glyphSequenceLength: 3,
    glyphGridSize: 3,
    purgeDuration: 5000,
    purgeSpikes: 2,
  },
  {
    level: 2,
    waveMatchThreshold: 0.97,
    glyphSequenceLength: 4,
    glyphGridSize: 4,
    purgeDuration: 6000,
    purgeSpikes: 3,
  },
  {
    level: 3,
    waveMatchThreshold: 0.98,
    glyphSequenceLength: 5,
    glyphGridSize: 4,
    purgeDuration: 7000,
    purgeSpikes: 5,
  },
];
