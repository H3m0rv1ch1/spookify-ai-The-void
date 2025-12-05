---
inclusion: always
---

# Spookify AI - The Void - Project Context

## Project Overview
This is a Halloween costume transformation app with a unique twist: users must complete cyberpunk-themed minigames to "defeat corruption" before they can generate AI transformations.

## Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **AI Service**: OpenRouter API (compatible with multiple AI models)
- **Styling**: Tailwind CSS with custom cyberpunk/horror theme
- **Canvas API**: For real-time waveform visualization

## Design System
### Color Palette
- `void`: #030005 (deep black background)
- `neon-red`: #FF2A2A (primary accent, danger, corruption)
- `ash`: #E2E8F0 (light text)
- `off-white`: #F5F5F0 (pure white text)

### Typography
- `font-display`: Syne (for headers, dramatic text)
- `font-tech`: Space Grotesk (for UI, technical elements)

### Animation Principles
- Use `animate-pulse` for active/dangerous elements
- Glitch effects for corruption theme
- Smooth transitions (0.3s-0.5s) for state changes
- Scanline effects for retro-tech aesthetic

## Code Conventions
- Use functional components with hooks
- TypeScript for type safety
- Modular component architecture
- Keep game logic separate from UI components
- Use descriptive variable names (e.g., `entityPosition`, `frequencyMatch`)

## Key Features
1. **Corruption Event**: Surprise hijacking of the app with boot sequence
2. **Three Minigames**: Glyph matching, waveform calibration, neural purge
3. **18+ Character Styles**: Organized in 4 categories
4. **AI Transformations**: Using OpenRouter API for image generation
5. **Comparison Slider**: Before/after with fullscreen zoom

## API Integration
- Users provide their own OpenRouter API key
- Stored in `.env.local` as `GEMINI_API_KEY` (legacy name, works with OpenRouter)
- Prompts are engineered for consistent character transformations
- Error handling for API failures

## Development Workflow
- Use Kiro for rapid prototyping and feature development
- Vibe coding for UI components and styling
- Test minigames for difficulty balance
- Optimize Canvas rendering for 60fps performance
