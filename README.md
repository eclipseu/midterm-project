# San Gubat: A Filipino Folklore Adventure

A compelling text-based adventure game that immerses players in the rich tapestry of Filipino folklore and supernatural creatures. Navigate through the mysterious town of San Gubat as you encounter legendary creatures like Manananggal, Aswang, Tiyanak, and Wakwak in this interactive horror experience.

## Table of Contents

- [About the Game](#about-the-game)
- [Features](#features)
- [Game Creatures](#game-creatures)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Game Mechanics](#game-mechanics)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## About the Game

San Gubat is an interactive fiction game that brings Filipino mythology to life through modern web technology. Players take on the role of an investigator arriving in the fear-stricken town of San Gubat, where supernatural creatures terrorize the local population. Your choices determine the story's outcome as you navigate through atmospheric environments, collect items, and face terrifying creatures from Philippine folklore.

The game features a branching narrative system where every decision matters, multiple endings based on player choices, and authentic Filipino cultural elements woven throughout the storyline.

## Features

### Core Gameplay

- **Interactive Storytelling**: Rich, branching narrative with multiple paths and endings
- **Choice-Driven Gameplay**: Every decision impacts the story progression and available options
- **Inventory System**: Collect and use items strategically to overcome challenges
- **Health Management**: Monitor your character's health as you face supernatural dangers
- **Save System**: Automatic game state persistence using local storage

### Atmospheric Elements

- **Immersive Visuals**: Hand-crafted backgrounds depicting authentic Filipino rural settings
- **Character Portraits**: Dynamic character images that change based on story context
- **Jump Scares**: Carefully timed horror elements to enhance tension
- **Audio Integration**: Atmospheric sound effects for different creatures
- **Cultural Authenticity**: Genuine Filipino folklore elements and terminology

### Technical Features

- **Responsive Design**: Optimized for various screen sizes and devices
- **TypeScript Integration**: Type-safe development for robust code quality
- **Modern React Architecture**: Component-based design with context management
- **Performance Optimized**: Built with Vite for fast development and production builds

## Game Creatures

The game features authentic Filipino supernatural beings, each with unique characteristics and weaknesses:

### Manananggal

A vampiric creature that separates at the waist, with bat-like wings on its upper torso. Vulnerable to salt (asin) and known for feeding on unborn children and human flesh.

### Aswang

A shape-shifting creature that can take various forms. One of the most feared creatures in Filipino folklore, known for its cunning and predatory nature.

### Tiyanak

A vampiric creature that appears as an infant to lure victims. Once a baby that died before baptism, it seeks revenge on the living.

### Wakwak

A bird-like creature with razor-sharp claws and a distinctive cry. Known for its ability to snatch victims and carry them away in the night.

## Technology Stack

### Frontend Framework

- **React 19.1.1**: Modern component-based UI framework
- **TypeScript 5.8.3**: Type-safe JavaScript development
- **React Router DOM 7.9.1**: Client-side routing for single-page application

### Styling & UI

- **Tailwind CSS 4.1.13**: Utility-first CSS framework for rapid styling
- **CSS Modules**: Scoped styling for component-specific styles
- **Custom CSS Animations**: Hand-crafted animations for enhanced user experience

### Development Tools

- **Vite 7.1.2**: Next-generation frontend build tool
- **ESLint**: Code linting for consistent code quality
- **PostCSS**: CSS processing with autoprefixer

### Additional Libraries

- **Lucide React**: Modern icon library
- **Zod**: Runtime type validation

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher (comes with Node.js)
- **Git**: For version control (optional but recommended)

## Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/midterm-project.git
   cd midterm-project
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to start playing the game.

## Development

### Available Scripts

- **Development Server**

  ```bash
  npm run dev
  ```

  Starts the Vite development server with hot module replacement.

- **Build for Production**

  ```bash
  npm run build
  ```

  Compiles TypeScript and builds the project for production.

- **Preview Production Build**

  ```bash
  npm run preview
  ```

  Serves the production build locally for testing.

- **Lint Code**
  ```bash
  npm run lint
  ```
  Runs ESLint to check for code quality issues.

### Development Guidelines

1. **Type Safety**: All new code should be properly typed using TypeScript
2. **Component Structure**: Follow the established component hierarchy
3. **Styling**: Use Tailwind CSS utilities with CSS modules for component-specific styles
4. **Story Data**: Game content is stored in `src/data/story.json` for easy modification

## Game Mechanics

### Health System

- Players start with 100 HP
- Certain choices and encounters can reduce health
- Reaching 0 HP results in game over
- Health management adds strategic depth to decision-making

### Inventory System

- Collect items throughout your journey
- Items are required for specific choices and actions
- Strategic item usage can determine success or failure
- Items include traditional Filipino protective elements

### Choice System

- Branching narrative with multiple story paths
- Choices may require specific items to be available
- Some choices have immediate consequences (health loss, jump scares)
- Hidden choices become available based on inventory and previous decisions

### Save System

- Automatic save functionality using browser local storage
- Game state includes player progress, inventory, and visited locations
- Continue from where you left off across browser sessions

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── game/            # Game-specific components
│   ├── layout/          # Layout components
│   └── ui/              # Generic UI components
├── contexts/            # React context providers
├── data/                # Game content and story data
├── pages/               # Main game screens
├── services/            # Business logic and utilities
├── styles/              # CSS files and styling
└── types/               # TypeScript type definitions

public/
└── assets/              # Game assets
    ├── audio/           # Sound effects
    ├── backgrounds/     # Background images
    ├── characters/      # Character portraits
    └── jumpscares/      # Horror elements
```

### Key Directories

- **`src/components/game/`**: Core game UI components like DialogueBox, ChoiceList, and Inventory
- **`src/data/story.json`**: Complete game narrative with all story nodes and choices
- **`src/contexts/GameContext.tsx`**: Central game state management
- **`src/services/`**: Game engine, story parser, and persistence logic
- **`public/assets/`**: All visual and audio assets organized by type

## Contributing

We welcome contributions to enhance the game experience. Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Follow the existing code style** and TypeScript conventions
3. **Test your changes** thoroughly before submitting
4. **Update documentation** if you add new features
5. **Submit a pull request** with a clear description of changes

### Areas for Contribution

- Additional story branches and endings
- New creatures from Filipino folklore
- Enhanced visual effects and animations
- Accessibility improvements
- Performance optimizations
- Mobile experience enhancements

---

**Note**: This game contains horror elements and jump scares. Player discretion is advised. The game is designed to celebrate and preserve Filipino cultural heritage through interactive storytelling.
{
files: ['**/*.{ts,tsx}'],
extends: [
// Other configs...
// Enable lint rules for React
reactX.configs['recommended-typescript'],
// Enable lint rules for React DOM
reactDom.configs.recommended,
],
languageOptions: {
parserOptions: {
project: ['./tsconfig.node.json', './tsconfig.app.json'],
tsconfigRootDir: import.meta.dirname,
},
// other options...
},
},
])

```

```
