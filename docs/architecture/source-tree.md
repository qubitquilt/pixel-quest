# **4. Unified Project Structure**

This structure outlines the monorepo layout using npm workspaces.

/pixel-quest
 ├── packages/
 │   ├── client/                 \# The Next.js frontend application
 │   │   ├── app/                \# Next.js app router (pages, components, lib)
 │   │   ├── components/         \# UI components (ui, shared)
 │   │   ├── lib/                \# Utility functions
 │   │   ├── public/             \# Static assets
 │   │   └── ...                 \# Next.js files (next.config.js, etc.)
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
 ├── package.json                \# Root package.json with hoisted deps and workspaces
 ├── tsconfig.json               \# Root TypeScript config with paths and composite projects
 ├── babel.config.ts             \# Babel config for decorators (server/shared)
 ├── jest.config.cts             \# Jest config for client/server tests
 └── README.md
