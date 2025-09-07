# **Multiplayer Maze Racer - Product Requirements Document (PRD)**

## **Change Log**

| Date | Version | Description | Author |
| :---- | :---- | :---- | :---- |
| 2025-09-06 | 1.0 | Initial draft from brief | John, PM |
| 2025-09-06 | 1.1 | Added Colyseus, flashlight visibility, power-up key | John, PM |
| 2025-09-07 | 2.0 | Restructured into multiple Epics with new stories | John, PM |

## **1. Goals and Background Context**

This document outlines the requirements for the Minimum Viable Product (MVP) of the "Multiplayer Maze Racer" game. The primary goal is to create a fun, browser-based, 4-player maze game that serves as a practical learning project for a father-son team using Phaser. The project is intentionally scoped to be achievable and fun, focusing on core mechanics over extensive features.

## **2. Requirements**

#### **2.1. Functional Requirements**

* **FR1:** The system shall provide a simple lobby where a player can start a game and receive a shareable link for up to 3 other players to join.  
* **FR2:** For each round, the server must generate a new, random maze that is guaranteed to be solvable from each of the 4 player starting positions.  
* **FR3:** Players must be able to control a character within the maze using keyboard inputs (up, down, left, right).  
* **FR4:** Each player's view of the maze must be restricted by a "flashlight" mechanic, limiting their line of sight.  
* **FR5:** A round immediately concludes when the first player's character reaches the treasure at the center of the maze.  
* **FR6:** The winner of the round shall be awarded points based on a treasure value that starts at 100 and decreases over time at an accelerating rate.  
* **FR7:** Upon round completion, non-winning players shall be awarded points proportional to their remaining optimal distance to the treasure, based on the winner's score.  
* **FR8:** Players shall be able to pick up and use four distinct power-ups: Speed Boost, Brighter Flashlight, X-Ray Vision, and Blackout.  
* **FR9:** The game host shall be able to select the number of rounds for a match (e.g., Best of 3, 5, or 10).

#### **2.2. Non-Functional Requirements**

* **NFR1:** The game must be playable in a modern desktop web browser without any required downloads or installations.  
* **NFR2:** All hosting and backend services must operate within the free-tier limits of Google Cloud.  
* **NFR3:** The game must maintain a smooth framerate on typical consumer laptop hardware.

## **3. Technical Assumptions**

* **Game Engine:** Phaser  
* **Web Framework:** Vite or Next.js  
* **Backend:** Node.js with **Colyseus** for multiplayer matchmaking and room management.  
* **Repository:** A monorepo structure will be used to house both the frontend client and the backend server.

## **4. Epic & Story Structure**

The MVP will be developed through a series of focused epics.

## **Epic 1: Project & Lobby Setup**

**Epic Goal:** To establish the basic project structure and allow players to create, join, and start a game from a shared lobby.

* **Story 1.1:** As a host, I want to initialize a new game session on the server so that a lobby is ready for my friends.  
* **Story 1.2:** As a host, I want to see a unique, shareable URL on the lobby screen so that I can easily invite my friends.  
* **Story 1.3:** As a player joining a game, I want to see my name and other players' names appear in the lobby so I know who is in the game.  
* **Story 1.4:** As a host, I want the "Start Game" button to be enabled only when at least one other player has joined.

## **Epic 2: Maze Generation & Display**

**Epic Goal:** To programmatically generate a fair and random maze on the server for each round and render it on all player clients.

* **Story 2.1:** As a developer, I need a maze generation algorithm on the server so that a new, fair maze can be created for each round.  
* **Story 2.2:** As a server, I want to send the complete maze data to all clients when a round starts so they can render the game world.  
* **Story 2.3:** As a client, I want to receive the maze data and render it visually using Phaser so that I can see the game board.

## **Epic 3: Player Movement & State Sync**

**Epic Goal:** To enable player control of characters and synchronize their positions across all clients in real-time.

* **Story 3.1:** As a player, I want my keyboard inputs to move my character on my screen so that I can control my player.  
* **Story 3.2:** As a player, I want my client to send my position updates to the server so that my movements are part of the official game state.  
* **Story 3.3:** As a server, I want to receive position updates and broadcast them to all other clients so that everyone's game is synchronized.  
* **Story 3.4:** As a player, I want to see my opponents' characters moving on my screen based on server updates so that I know where they are.  
* **Story 3.5:** As a developer, I need to implement collision detection between players and maze walls so that players cannot walk through them.

## **Epic 4: Core Gameplay Mechanics (Flashlight & Win Condition)**

**Epic Goal:** To implement the core "flashlight" visibility mechanic and the logic for ending a round when a winner is determined.

* **Story 4.1:** As a developer, I want to implement a "fog of war" or mask effect in Phaser to create the flashlight visibility cone for the local player.  
* **Story 4.2:** As a player, I want my flashlight cone to be visible to other players, and I want to see theirs, so we have shared visibility on the map.  
* **Story 4.3:** As a server, I want to detect when a player's position overlaps with the treasure's position to identify the round winner.  
* **Story 4.4:** As a server, I want to broadcast a "Round Over" event when a winner is found so that all clients know to end the round.

## **Epic 5: Scoring & Round Progression**

**Epic Goal:** To implement the complete scoring logic and the flow for progressing through a multi-round match.

* **Story 5.1:** As a server, I want to manage a time-depleting treasure score for each round, along with an accelerating audible beat.  
* **Story 5.2:** As a developer, I want to create a UI component that displays the current round, match score, and other key game info.  
* **Story 5.3:** As a server, I want to calculate scores for all players upon round completion based on the defined proportional distance logic.  
* **Story 5.4:** As a client, I want to display a round summary screen with scores when the round ends.  
* **Story 5.5:** As a developer, I need to implement the match logic to track round progression and declare a final winner.

## **Epic 6: Power-Up System**

**Epic Goal:** To add depth and replayability by allowing players to find and use four unique power-ups.

* **Story 6.1:** As a server, I want to spawn power-up items at random, valid locations within the maze at the start of each round.  
* **Story 6.2:** As a player, I want to see and collide with power-up items to collect them, which then removes them from the map for all players.  
* **Story 6.3:** As a developer, I need a UI element to show the player which power-up they are currently holding.  
* **Story 6.4:** As a player, I want to press the spacebar to activate my collected power-up, triggering its effect.  
* **Story 6.5:** As a developer, I need to implement the server-side logic for each of the four power-up effects (Speed Boost, Brighter Flashlight, X-Ray Vision, and Blackout).