# **Multiplayer Maze Racer \- UI/UX Specification**

### **Change Log**

| Date | Version | Description | Author |
| :---- | :---- | :---- | :---- |
| 2025-09-07 | 1.0 | Initial draft | Sally, UX |
| 2025-09-07 | 1.1 | Added IA and User Flows | Sally, UX |
| 2025-09-07 | 1.2 | Added Game Screen Wireframe | Sally, UX |
| 2025-09-07 | 1.3 | Added Summary/End Screens | Sally, UX |

### **1\. Overall UX Goals & Principles**

This document defines the user experience goals, information architecture, user flows, and visual design specifications for the game.

#### **1.1. Target User Personas**

* **The Learner (Primary):** An 11-year-old who is new to coding. The experience should be exciting and rewarding, making the connection between code and fun tangible.  
* **The Players (Secondary):** Friends and family who are new to the game. The experience must be intuitive, easy to pick up, and socially engaging.

#### **1.2. Usability Goals**

* **Immediate Fun:** A new player should understand the goal and how to play within 60 seconds.  
* **High Engagement:** The game's mechanics (flashlight, depleting score) should create a feeling of tension and excitement that makes players want to play again.  
* **Clarity:** All UI elements (scores, power-up status) must be clear and instantly understandable at a glance during gameplay.

#### **1.3. Design Principles**

1. **Immersion Over Interface:** The UI should feel like part of the "cave" environment. Menus and overlays should be minimal and thematic, ensuring the player stays focused on the maze.  
2. **Clarity in the Dark:** Given the flashlight mechanic, all essential information must be presented with high contrast and legibility.  
3. **Encourage Rivalry:** The design should subtly highlight the competitive aspects, like showing other players' flashlight beams or score changes, to foster fun, friendly competition.  
4. **Simplicity is Key:** From the lobby to the game over screen, the flow should be simple and require the fewest clicks possible to get into the action.

### **2\. Information Architecture (IA)**

This section outlines the primary screens and their relationships.

#### **2.1. Screen Map**

graph TD  
    A\[Start Screen\] \--\> B{Host or Join?};  
    B \-- Host Game \--\> C\[Lobby Screen\];  
    B \-- Join via URL \--\> C;  
    C \-- Start Game \--\> D\[Game Screen\];  
    D \-- Round Ends \--\> E\[Round Summary Screen\];  
    E \-- Next Round \--\> D;  
    E \-- Match Ends \--\> F\[Match Over Screen\];  
    F \-- Play Again \--\> C;  
    F \-- Main Menu \--\> A;

### **3\. User Flows**

This section details the step-by-step path a user takes to complete key tasks.

#### **3.1. Flow: Starting and Joining a Game**

* **User Goal:** To get from the start screen into a lobby with at least one other friend, ready to play.  
* **Entry Points:** The main game URL.  
* **Success Criteria:** The host and at least one other player are in the lobby, and the "Start Game" button is active.  
* **Flow Diagram:**  
  sequenceDiagram  
      participant P1 as Player 1 (Host)  
      participant S as System  
      participant P2 as Player 2 (Friend)

      P1-\>\>S: Clicks "Host Game"  
      S--\>\>P1: Creates Lobby & Shows Share URL  
      P1-\>\>P2: Shares URL  
      P2-\>\>S: Accesses URL  
      S--\>\>P1: P2 appears in Lobby  
      S--\>\>P2: P2 appears in Lobby  
      S--\>\>P1: "Start Game" button becomes active

### **4\. Wireframes & Mockups**

This section provides low-fidelity layouts for the primary game screens.

#### **4.1. Game Screen HUD (Heads-Up Display)**

* **Purpose:** To provide all necessary in-game information to the player without distracting from the core gameplay of navigating the maze. The design is minimal to enhance immersion.  
* **Key Elements:**  
  * **Round Indicator:** Shows the current round and the total rounds for the match (e.g., "Round 1 of 3").  
  * **Match Score:** A persistent display of all players' total scores for the match.  
  * **Current Treasure Value:** A prominent display of the round's treasure score, visibly counting down.  
  * **Power-Up Status:** An icon showing which power-up the player is currently holding.  
* **Conceptual Layout:**  
  \+------------------------------------------------------+  
  | \[Round 1/3\]   \[Player1: 150\] \[Player2: 90\]            |  \<-- Top Left: Round & Scores  
  |                                                      |  
  |                   TREASURE: 88                       |  \<-- Top Center: Treasure Value  
  |                                                      |  
  |                    (GAMEPLAY AREA)                   |  
  |                                                      |  
  |              \[ICON: Speed Boost\]                     |  \<-- Bottom Center: Power-Up  
  \+------------------------------------------------------+

* **Interaction Notes:**  
  * When the treasure value drops below 25, it should start flashing red to increase pressure.  
  * The Power-Up icon should have a subtle glow or animation when a power-up is ready to be used.

#### **4.2. Round Summary Screen**

* **Purpose:** To display the results of the completed round and show the updated match standings before the next round begins.  
* **Key Elements:**  
  * A clear declaration of the round winner.  
  * A table showing the score each player earned in that round.  
  * The updated total match scores for all players.  
  * A countdown or button to start the next round.  
* **Conceptual Layout:**  
  \+------------------------------------------------------+  
  |                                                      |  
  |               PLAYER 2 WINS THE ROUND\!               |  
  |                                                      |  
  |            \+--------------------------+              |  
  |            | Round Scores   | Total   |              |  
  |            |----------------|---------|              |  
  |            | Player 2: \+88  |   178   |              |  
  |            | Player 1: \+40  |   190   |              |  
  |            | ...            |   ...   |              |  
  |            \+--------------------------+              |  
  |                                                      |  
  |               Next round starts in: 5...             |  
  |                                                      |  
  \+------------------------------------------------------+

#### **4.3. Match Over Screen**

* **Purpose:** To declare the overall winner of the match and provide options to play again or return to the main menu.  
* **Key Elements:**  
  * A prominent declaration of the final winner.  
  * The final match scores for all players, ranked.  
  * A "Play Again" button that takes all players back to the lobby.  
  * A "Main Menu" button to exit the session.  
* **Conceptual Layout:**  
  \+------------------------------------------------------+  
  |                                                      |  
  |              PLAYER 1 IS THE MAZE KING\!              |  
  |                                                      |  
  |                 \+------------------+                 |  
  |                 |   Final Scores   |                 |  
  |                 |------------------|                 |  
  |                 | 1\. Player 1: 275 |                 |  
  |                 | 2\. Player 2: 240 |                 |  
  |                 | ...              |                 |  
  |                 \+------------------+                 |  
  |                                                      |  
  |           \[ Play Again \]   \[ Main Menu \]             |  
  |                                                      |  
  \+------------------------------------------------------+  
