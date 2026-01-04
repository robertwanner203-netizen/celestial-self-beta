# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Celestial Self is a personal astrology companion web app that integrates Western Astrology with Yoruba cosmological wisdom. Built with React 19.2.3 and Create React App 5.0.1, it provides natal chart calculations, daily insights, and spiritual guidance through the lens of both astrological and Yoruba traditions.

**Key Technologies:**
- React 19.2.3 (functional components, hooks)
- astronomy-engine (for accurate ephemeris calculations)
- Optional dependencies: sweph-wasm, astronomia (for advanced house systems)
- localStorage for data persistence
- Deployed to GitHub Pages

## Development Commands

```bash
# Start development server (opens http://localhost:3000)
npm start

# Run tests in interactive watch mode
npm test

# Build for production (outputs to build/)
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Architecture

### Current State
The app is currently a **single-file component** (`src/CelestialSelf.jsx`, 1200+ lines) with:
- State management via React useState/useEffect hooks
- localStorage for data persistence
- Internal state-based screen switching (no router)
- Inline styles using JavaScript objects

### Key Files & Modules

**Core Component:**
- `src/CelestialSelf.jsx` - Main application component containing all screens and logic

**Utilities:**
- `src/utils/ephemeris.js` - Accurate planetary position calculations using astronomy-engine
  - `getNatalChart()` - Main function to calculate natal chart positions, ascendant, and houses
  - `getPlanetLongitude()` - Get ecliptic longitude for a planet at a given date
  - `isRetrograde()` - Detect retrograde motion by comparing consecutive day positions
  - `getAscendant()` - Calculate rising sign using local sidereal time
- `src/utils/houses.js` - House system calculations
  - `calculateHouses()` - Equal house system (default)
  - `calculateHousesWithSystem()` - Advanced house systems (Placidus, Koch, whole-sign) with fallbacks to optional dependencies
- `src/utils/geocode.js` - Birth location handling (simplified, no real geocoding API)
- `src/utils/ephemerisApi.js` - External ephemeris API integration (optional)

**Data Constants:**
- `ZODIAC_SIGNS` - 12 zodiac signs array
- `ASPECTS` - Major aspects with angles, orbs, symbols, and nature
- `PLANET_GLYPHS` / `SIGN_GLYPHS` - Unicode symbols for planets and signs
- `ORISHA_CORRESPONDENCES` - Maps planets to Yoruba Orishas with domains and traits
- `ELEMENTS` - Element (fire/earth/air/water) for each sign

### Astronomical Calculations

The app uses `astronomy-engine` for **astronomically accurate** ephemeris data:
- Planetary positions accurate to within ~2 degrees
- True retrograde detection based on orbital mechanics
- Accurate ascendant calculation from local sidereal time
- House cusps via equal houses (default) or advanced systems via optional dependencies

**Important:** The earlier simplified ephemeris functions have been replaced. Always use `getNatalChart()` from `src/utils/ephemeris.js` for chart calculations.

### Aspect Calculation

`calculateAspects(positions)` in `CelestialSelf.jsx` computes aspects between planetary positions:
- Checks all planet pairs for major aspects (conjunction, sextile, square, trine, opposition)
- Uses configurable orbs (8° for major, 6° for sextile)
- Returns aspect objects with planet names, aspect type, symbol, nature, and orb

### Moon Phase Calculation

`getMoonPhase(date)` calculates current moon phase based on synodic lunar cycle (29.53 days):
- Returns phase name, emoji, and illumination percentage
- Uses 2000-01-06 as reference new moon

## Design System

**Color Palette (Purple/Violet theme):**
- Background: `#0d0d12` (primary), `#1a1520` (secondary), `#252030` (tertiary)
- Accent: `#c9a0dc` (primary), `#9d8ec2` (secondary), `#7b6b9e` (tertiary)
- Text: `#e8e6ed` (primary), `#c0b8cf` (secondary)
- Elements: Fire `#d4a574`, Earth `#8b9a82`, Air `#a8b5c4`, Water `#7a9bb5`

**Typography:**
- Headings: Cormorant Garamond
- Body: Nunito Sans
- Accent: Cinzel

**Styling Approach:** Inline JavaScript style objects (no CSS files or styled-components)

## Key Architectural Patterns

### Dual Interpretation Framework
All astrological content provides both:
1. **Western Astrology** - Psychological/archetypal interpretation
2. **Yoruba Cosmology** - Orisha correspondences and spiritual wisdom

This dual lens is core to the app's identity. When adding interpretations, always include both perspectives.

### Cultural Sensitivity
- Yoruba content is **educational/inspirational**, not a substitute for traditional Ifá divination
- Always acknowledge the living Yoruba religious tradition
- Avoid cultural appropriation or oversimplification
- Tone should be warm, wise, empowering - never fatalistic or fear-based

## Development Roadmap Context

The `celestial-self-spec.json` file contains a comprehensive feature roadmap with:
- **New Features** (NF-###) - Major features like synastry charts, transit calendars, retrograde trackers
- **Content Expansion** (CE-###) - Interpretations for moon signs, rising signs, houses, aspects
- **Technical Improvements** (TI-###) - Modularization, TypeScript migration, accessibility
- **Bug Fixes** (BF-###) - Known issues

**Status Values:**
- `execute` - Ready to implement
- `continue planning` - Needs more design work before implementation
- `identified` - Known but not prioritized

When implementing features, consult this spec for acceptance criteria, dependencies, and design considerations.

## Testing

Tests use React Testing Library and Jest:
- `src/App.test.js` - Basic smoke test
- `src/setupTests.js` - Test environment setup

Run tests with `npm test` (interactive watch mode).

## Known Issues & Quirks

1. **Typo in source** (BF-001): `ZODIAC_SIGNS` originally had "Libitha" but is corrected at runtime. Should be fixed in source as "Libra".
2. **No real geocoding**: Birth location uses simplified city name input, not actual geocoding API.
3. **Optional dependencies**: `sweph-wasm` and `astronomia` are optional - the app gracefully falls back to equal houses if they're not available.
4. **Large single file**: The main component is 1200+ lines. Future work will modularize into feature folders (see TI-001 in spec).

## Future Considerations

**Target State:**
- Modular component architecture with feature folders
- React Context for global state management
- React Router for deep linking (PWA preparation)
- Potential React Native migration for mobile apps

**When adding features:**
- Maintain existing purple/violet color palette
- Use the dual Western/Yoruba framework for all astrological content
- Keep spiritual content respectful and educational
- Prefer psychological/archetypal astrology over deterministic predictions
- Write in a poetic but grounded style using metaphor and archetype
