# **3. Data Models**

These TypeScript interfaces define the core data structures for the game. They will be placed in a shared package within the monorepo to ensure type safety between the client and server.

## **3.1. Player**

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

## **3.2. PowerUp**

**Purpose:** Represents a power-up item on the map.

// packages/shared/types/index.ts  
export type PowerUpType \= 'SpeedBoost' | 'BrighterFlashlight' | 'XRayVision' | 'Blackout';

export interface PowerUp {  
  id: string; // Unique identifier for the power-up instance  
  type: PowerUpType;  
  x: number;  
  y: number;  
}

## **3.3. GameState**

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
