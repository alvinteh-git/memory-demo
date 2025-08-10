# Gemstone Memory

A progressive pattern-matching memory game where players observe and replicate increasingly complex gemstone sequences. Built with React, TypeScript, and Vite.

## Play Now

- **Live Demo**: The game is ready to play! See deployment instructions below.
- **Local Testing**: Run `npm run dev` and open http://localhost:5173

## Game Overview

**Gemstone Memory** is a skill-based memory game featuring:
- 4 unique gemstones with distinct shapes and colors
- Progressive difficulty that increases each round
- 6 gameplay variations that unlock as you progress
- Arcade-style ticket economy system
- Responsive design for desktop and mobile

### How to Play
1. Watch the gemstone pattern carefully
2. Repeat the pattern in the correct order
3. Patterns get longer and faster each round
4. Special variations unlock at rounds 2, 5, 8, 11, 14, and 17+
5. Earn tickets based on your performance

### Game Features
- **Round 1**: Calibration round introducing all 4 gemstones
- **Progressive Difficulty**: Pattern length increases every 3 rounds
- **Timer System**: Visual countdown with warning states
- **Variation Modes**: 
  - Reverse Mode (Round 2+)
  - Ghost Pattern (Round 5+)
  - Speed Chaos (Round 8+)
  - Color Shuffle (Round 11+)
  - Selective Attention (Round 14+)
  - Combination Mode (Round 17+)

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/gemstone-memory.git
cd gemstone-memory

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production
```bash
# Build the game
npm run build

# Preview production build
npm run preview
```

## Deployment

### Option 1: Netlify Drop (Easiest - No Account Needed)
1. Run `npm run build`
2. Go to https://app.netlify.com/drop
3. Drag the `dist` folder onto the page
4. Get an instant URL to share!

### Option 2: GitHub Pages
1. Build the game: `npm run build`
2. Push `dist` contents to a GitHub repository
3. Enable GitHub Pages in repository settings
4. Access at `https://[username].github.io/[repo-name]/`

### Option 3: Direct File Sharing
- A ready-to-share ZIP package is created after building: `gemstone-memory-game.zip` (188KB)
- Recipients can extract and open `index.html` directly

### Option 4: Any Static Host
The `dist` folder can be deployed to any static hosting service:
- Vercel
- Surge.sh
- Firebase Hosting
- AWS S3
- And more!

## Project Structure

```
skillgame/
├── src/
│   ├── core/              # Game logic and business rules
│   │   ├── game/          # Game engine and state management
│   │   ├── economy/       # Ticket system
│   │   └── variations/    # Gameplay variations
│   ├── presentation/      # React components and UI
│   │   └── components/
│   │       ├── game/      # Game components
│   │       └── ui/        # Reusable UI components
│   ├── styles/            # Global styles and CSS
│   └── utils/             # Utility functions
├── specs/                 # Game design specifications
├── public/               # Static assets
└── dist/                 # Production build (generated)
```

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: ShadCN UI
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **Architecture**: Clean Architecture with TDD

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run test     # Run tests
npm run lint     # Run linter
```

### Configuration

Game parameters can be adjusted in:
- `public/ticket_config.yml` - Ticket economy settings
- `src/core/game/constants.ts` - Game constants
- `specs/` - Complete game specifications

## Documentation

Detailed documentation is available in the `specs/` directory

## Testing

The project uses Test-Driven Development (TDD) with Vitest:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```

## Design

- **Color Palette**: Warm beige background with vibrant gemstone colors
- **Gemstones**: 
  - Emerald (Green Rectangle)
  - Trillion (Red Triangle)
  - Marquise (Purple Eye)
  - Cushion (Cyan Square)
- **Typography**: ABCDiatypeMono monospace font
- **Responsive**: Adapts to desktop and mobile screens

## License

This project is open source and available under the GPL License.

## Acknowledgments

- Built with React + TypeScript + Vite
- UI components from ShadCN
- Developed using Test-Driven Development principles

---

**Ready to test your memory?** Build the game and start playing!