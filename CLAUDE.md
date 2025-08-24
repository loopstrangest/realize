# Realize - Word Finding Game

## Project Overview
A web app game optimized for mobile (portrait full-screen) but playable on desktop and tablet. Players tap words in order to spell "I WANT TO REALIZE ALL OF MY DESIRES" across multiple unique levels. Each level presents these words in creative and clever ways.

## Tech Stack
- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: npm
- **State Management**: React's built-in useState/useContext
- **Data Persistence**: Local Storage (for level progress)

## Key Commands
- `npm run dev` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production

## Game Mechanics
- **Target Phrase**: "I WANT TO REALIZE ALL OF MY DESIRES"
- **Gameplay**: Tap words in correct sequence
- **Level Progression**: Auto-advance with fade out/in animation
- **Progress Saving**: Local storage tracks current level and completed levels
- **Level Navigation**: Users can replay any previously completed level
- **Game Completion**: Congratulations screen with restart option

## Architecture
```
/src
├── components/          # Reusable UI components
├── levels/             # Individual level components
│   ├── levelIntro.tsx
│   ├── levelTelephone.tsx
│   ├── levelHangman.tsx
│   └── ...
├── hooks/              # Custom React hooks
├── utils/              # Helper functions
├── types/              # TypeScript type definitions
└── styles/             # Global styles (if needed)
```

## Level System
- **Modular Design**: Each level is a separate TypeScript file with descriptive names
- **Easy Reordering**: Levels can be easily reordered without code changes
- **Unique Logic**: Each level contains its own game logic and presentation
- **Consistent Interface**: All levels follow same completion pattern

## Design Principles
- **Mobile-First**: Portrait full-screen optimization for mobile
- **Responsive**: Scales well to desktop and tablet
- **Accessibility**: Consider touch targets and screen readers
- **Performance**: Smooth animations and quick load times

## State Management
- Current level tracking
- Completed levels array
- Game progress persistence via localStorage
- Level transition states for animations

## Development Notes
- Levels named by concept (levelIntro, levelTelephone, etc.)
- Auto-advance between levels with fade transitions
- Additional animations and effects to be determined during development
- Regular CSS can be used alongside Tailwind when needed