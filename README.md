# 🪄 REALIZE

A word-finding web game where players tap their way through the phrase "I WANT TO REALIZE ALL OF MY DESIRES" across multiple creative and interactive levels.

## 🎮 Game Overview

**REALIZE** is an engaging web-based game optimized for mobile, tablet, and desktop. Each level presents the target words in unique and clever ways, challenging players to find and tap them in the correct sequence.

### Target Phrase
```
I WANT TO REALIZE ALL OF MY DESIRES
```

## 🎯 Current Levels

### Level 1: Introduction Grid
Words appear one at a time in a 4×2 grid layout. Click each word as it appears to progress through the sequence.

### Level 2: Spinning Circle 
Words are arranged in a curved, spinning circle formation. Each word appears individually as letters following the circle's circumference.

### Level 3: Bouncing Screensaver
Classic '90s screensaver style! Words bounce around the screen diagonally, bouncing off walls. Click the moving word to advance.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/loopstrangest/realize.git
cd realize
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to play the game.

## 🛠 Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React's built-in hooks (useState, useContext)
- **Data Persistence**: Local Storage
- **Build Tool**: Create React App

## 🎨 Features

- **Mobile-First Design**: Optimized for portrait mobile gameplay
- **Responsive**: Scales beautifully to tablet and desktop
- **Progress Saving**: Game progress persists across browser sessions
- **Level Navigation**: Replay any previously completed level
- **Smooth Transitions**: Elegant fade animations between levels
- **Modular Architecture**: Easy to add new levels

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
├── levels/             # Individual level implementations
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── utils/              # Helper functions and utilities
```

## 🎮 Development

### Adding New Levels

1. Create a new level component in `src/levels/`
2. Add it to the level registry in `src/utils/levelRegistry.ts`
3. Implement the `LevelProps` interface

### Available Scripts

- `npm start` - Development server
- `npm test` - Run tests
- `npm run build` - Production build

## 🎭 Game Design

Each level follows the core gameplay loop:
1. Present the 8 target words in a creative format
2. Player taps words in sequence: "I WANT TO REALIZE ALL OF MY DESIRES"
3. Smooth transition to the next level
4. Navigation allows revisiting completed levels

## 📱 Browser Support

- Chrome/Safari (mobile & desktop)
- Firefox
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

This is a personal project, but suggestions and ideas are welcome! Feel free to open an issue or submit a pull request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
