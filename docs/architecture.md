# **Multiplayer Maze Racer - Fullstack Architecture Document**

## **Change Log**

| Date | Version | Description | Author |
| :---- | :---- | :---- | :---- |
| 2025-09-07 | 1.0 | Initial Draft | Winston, Architect |
| 2025-09-07 | 1.1 | Unified on Google Cloud Platform | Winston, Architect |
| 2025-09-07 | 1.2 | Added Tech Stack & specified shadcn/ui | Winston, Architect |
| 2025-09-07 | 1.3 | Added Data Models and Project Structure | Winston, Architect |
| 2025-09-07 | 1.4 | Added Core Workflow Diagrams | Winston, Architect |

## **1. High-Level Architecture**

### **1.1. Technical Summary**

This architecture describes a modern fullstack web application hosted entirely on Google Cloud Platform (GCP). It is composed of two containerized services: a game client and a real-time multiplayer backend, both running on Google Cloud Run. The client will be built using Phaser within a Next.js web application. The backend will be a dedicated Node.js server running the Colyseus framework. This setup provides a clear separation of concerns, excellent scalability, and a unified infrastructure environment.

### **1.2. Platform and Infrastructure Choice**

* **Platform:** **Google Cloud Platform (GCP)**. We will use a single cloud provider for all hosting, which simplifies billing, networking, and identity management.  
* **Frontend Hosting:** **Google Cloud Run**. The Next.js client application will be containerized using Docker and deployed as a serverless service. A **Google Cloud Load Balancer** with **Cloud CDN** enabled will be placed in front of this service to provide global caching, a custom domain, and SSL.  
* **Backend Hosting:** **Google Cloud Run**. The Colyseus Node.js server will also be containerized and deployed as a separate, independently scalable service. This service will be configured to support WebSocket connections for real-time communication.

### **1.3. Repository Structure**

* **Structure:** **Monorepo**. We will use a single Git repository to hold both the frontend and backend code. This simplifies dependency management and ensures the client and server logic stay in sync.  
* **Monorepo Tool:** We'll use **npm workspaces**, which is built into Node.js and provides a simple way to manage the two separate packages (client and server) within one repository.

### **1.4. High-Level Architecture Diagram**

graph TD  
    subgraph Browser  
        P\[Player's Device\]  
    end

    subgraph Internet  
        P \-- HTTPS --\> LB\[Google Cloud Load Balancer \+ CDN\]  
        P \-- WebSocket --\> S\_GCR\[Game Server on Cloud Run\]  
    end  
      
    subgraph "Google Cloud Platform"  
        LB \--\> C\_GCR\[Client on Cloud Run\]  
        S\_GCR \-- Runs --\> S\[Colyseus Node.js Server\]  
        C\_GCR \-- Serves --\> C\[Phaser/Next.js Client\]  
    end

    C \-- Connects to --\> S

### **1.5. Architectural Patterns**

* **Client-Server:** A classic and necessary pattern for multiplayer games. The Colyseus server will be the authoritative source of game state, while the Phaser clients will render that state and send user inputs.  
* **Monorepo:** Using a single repository for both client and server code simplifies development, testing, and deployment.  
* **Containerization:** Both the client and server applications will be packaged as Docker containers, ensuring consistent environments from local development to production.  
* **Component-Based UI:** The game's non-gameplay screens (Lobby, Menus) will be built using reusable React components. We will use **shadcn/ui** for pre-built, accessible components which can be styled to match our game's theme, combined with custom components where needed.

## **2. Tech Stack**

This table represents the definitive list of technologies and specific versions to be used for this project. All development must adhere to this stack to ensure consistency.

| Category | Technology | Version | Purpose | Rationale |
| :---- | :---- | :---- | :---- | :---- |
| **Frontend Language** | TypeScript | \~5.x | Adds static typing to JavaScript | Enhances code quality, readability, and catches errors early. |
| **Web Framework** | Next.js | \~14.x | React framework for web applications | Provides structure, routing, and SSR capabilities for non-game screens. |
| **Game Engine** | Phaser | \~3.80.x | 2D game framework for HTML5 | Fast, free, and powerful. Ideal for 2D browser games. |
| **UI Components** | **shadcn/ui** | Latest | Accessible and composable UI components | Speeds up development of menus/lobby with high-quality, stylable components. |
| **Styling** | Tailwind CSS | \~3.x | Utility-first CSS framework | Comes with shadcn/ui and allows for rapid, consistent styling. |
| **Backend Language** | TypeScript | \~5.x | Adds static typing to JavaScript | Consistent language across the stack, improves backend code quality. |
| **Backend Framework** | Node.js | \~20.x | JavaScript runtime environment | Aligns with the JavaScript ecosystem of the frontend. |
| **Multiplayer** | Colyseus | \~0.15.x | Multiplayer game server framework for Node.js | Simplifies lobby, matchmaking, and real-time state synchronization. |
| **Containerization** | Docker | Latest | OS-level virtualization | Creates consistent, portable environments for both client and server. |
| **Infrastructure** | Google Cloud Run | N/A | Serverless container platform | Cost-effective, auto-scaling hosting for both services. |
| **Infrastructure** | Google Cloud Load Balancer | N/A | Global load balancing and CDN | Provides a single entry point, SSL, and caching for the frontend. |
| **Monorepo Tool** | npm workspaces | N/A | Manages multiple packages within one repository | Simplifies managing shared code between the client and server. |

## **3. Data Models**

These TypeScript interfaces define the core data structures for the game. They will be placed in a shared package within the monorepo to ensure type safety between the client and server.

### **3.1. Player**

**Purpose:** Represents a single player in the game room.

// packages/shared/types/index.ts  
export interface Player {  
  id: string; // Unique session ID from Colyseus  
  name: string;  
  x: number;  
  y: number;  
  isWinner: boolean;  
  currentPowerUp: PowerUpType | null;  
  roundScore: number;  
  matchScore: number;  
}

### **3.2. PowerUp**

**Purpose:** Represents a power-up item on the map.

// packages/shared/types/index.ts  
export type PowerUpType \= 'SpeedBoost' | 'BrighterFlashlight' | 'XRayVision' | 'Blackout';

export interface PowerUp {  
  id: string; // Unique identifier for the power-up instance  
  type: PowerUpType;  
  x: number;  
  y: number;  
}

### **3.3. GameState**

**Purpose:** The main state object managed by the Colyseus room, synchronized with all clients.

// packages/shared/types/index.ts  
import { Schema, MapSchema } from '@colyseus/schema';

// This will be the actual Colyseus schema on the server  
export class GameState extends Schema {  
  players \= new MapSchema\<Player\>();  
  powerUps \= new MapSchema\<PowerUp\>();  
  maze: number\[\]\[\]; // 2D array representing the maze layout  
  treasureValue: number;  
  roundState: 'waiting' | 'playing' | 'summary';  
  round: number;  
  totalRounds: number;  
}

## **4. Unified Project Structure**

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

## **5. Core Workflows**

These diagrams illustrate the real-time communication between the client and server for key gameplay events.

### **5.1. Player Joins Game**

sequenceDiagram  
    participant Client as Player's Client (Browser)  
    participant Server as Colyseus Server (Cloud Run)

    Client-\>\>Server: Attempts to join room with name/ID  
    Server-\>\>Server: onJoin(): Creates new Player instance  
    Server-\>\>Server: Adds player to GameState.players  
    Server--\>\>Client: Sends full GameState to new client  
    Note over Server,Client: Server automatically broadcasts state\<br/\>change to all existing clients  
    Client-\>\>Client: onStateChange(): Renders all players and game world

### **5.2. Player Moves**

sequenceDiagram  
    participant Client as Player's Client (Phaser)  
    participant Server as Colyseus Server (Cloud Run)

    Client-\>\>Client: User presses movement key  
    Client-\>\>Server: Sends "move" message with direction  
    Server-\>\>Server: onMessage("move"): Validates move (e.g., no wall collision)  
    alt If move is valid  
        Server-\>\>Server: Updates player's x, y in GameState  
    end  
    Note over Server,Client: Colyseus automatically sends the updated\<br/\>player position to all clients  
    Client-\>\>Client: onStateChange(): Updates the player sprite's position on screen

### **5.3. Player Uses Power-Up**

sequenceDiagram  
    participant Client as Player's Client (Phaser)  
    participant Server as Colyseus Server (Cloud Run)

    Client-\>\>Client: User presses spacebar to activate power-up  
    Client-\>\>Server: Sends "usePowerUp" message  
    Server-\>\>Server: onMessage("usePowerUp"): Validates player has power-up  
    Server-\>\>Server: Applies power-up effect (e.g., changes player state, sends messages)  
    Server-\>\>Server: Sets player's currentPowerUp to null  
    Note over Server,Client: GameState changes are broadcast to all clients  
    Client-\>\>Client: onStateChange(): Client-side visual effects for power-up are triggered