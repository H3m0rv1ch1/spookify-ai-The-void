export interface CostumeStyle {
  id: string;
  name: string;
  description: string;
  promptModifier: string;
  icon: string; // SVG URL (bundled by Vite for instant loading)
  hexColor: string; // For dynamic lighting
  accentColorClass: string; // Tailwind class
  gender: 'male' | 'female' | 'unisex';
  category: 'original' | 'supernatural' | 'game' | 'movie' | 'custom';
}

export enum AppState {
  IDLE = 'IDLE',
  SELECTING = 'SELECTING',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  RESULT = 'RESULT',
  ERROR = 'ERROR',
  GAME = 'GAME',
  CORRUPTION = 'CORRUPTION'
}