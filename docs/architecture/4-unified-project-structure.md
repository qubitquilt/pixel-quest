# **4. Unified Project Structure**

This structure outlines the monorepo layout using npm workspaces.

/maze-racer-monorepo  
├── packages/  
│   ├── client/                 \# The Next.js \+ Phaser frontend application  
│   │   ├── components/         \# React components for UI (lobby, HUD)  
│   │   ├── game/               \# Phaser-specific code (scenes, sprites)  
│   │   ├── pages/              \# Next.js pages/routes  
│   │   ├── public/             \# Static assets (images, fonts)  
│   │   ├── styles/             \# Global CSS and Tailwind config  
│   │   └── ...                 \# Other Next.js files (next.config.js, etc.)  
│   │  
│   ├── server/                 \# The Colyseus backend server  
│   │   ├── rooms/              \# Colyseus room definitions (e.g., MazeRaceRoom.ts)  
│   │   ├── services/           \# Services like maze generation  
│   │   └── index.ts            \# Server entry point  
│   │  
│   └── shared/                 \# Shared code between client and server  
│       └── types/  
│           └── index.ts        \# Shared TypeScript interfaces (Player, GameState, etc.)  
│  
├── .gitignore  
├── package.json                \# Root package.json defining workspaces  
└── README.md
