# **Project Brief: Multiplayer Maze Racer**

Session Date: 2025-09-06  
Facilitator: Mary, Business Analyst  
Participant: User

### **Executive Summary**

The project is a multiplayer maze game for up to four players, designed to be a fun and educational coding experience for a father and his 11-year-old son. Built for the browser using the Phaser framework, the game challenges players to navigate a dark, cave-like maze with a limited line-of-sight to be the first to find a central treasure. The core value proposition is to create an engaging, shareable game that serves as a practical and enjoyable platform for learning web development and game design principles.

### **Problem Statement**

Learning to code, especially for a young person, can often feel abstract and unmotivating. Traditional exercises lack the engagement needed to maintain interest and demonstrate the tangible, fun outcomes of programming. Furthermore, there is a scarcity of beginner-friendly projects that are both genuinely exciting and teach foundational principles of modern web and game development. Existing simple tutorials are often single-player and fail to capture the social and competitive fun that makes gaming a compelling hobby. This project aims to solve that problem by providing a clear, exciting goal—building a shareable multiplayer maze game—that serves as a practical, motivating, and collaborative vehicle for learning to code.

### **Proposed Solution**

We will build a 2D multiplayer maze game using the Phaser framework, packaged for the web with Vite or Next.js. The core experience centers on up to four players simultaneously racing through a randomly generated maze to be the first to reach a treasure at the center.

The key differentiator is the "flashlight" mechanic, which limits each player's visibility to a cone of light, turning simple navigation into tense exploration. This, combined with competitive power-ups (e.g., speed boosts, temporarily blinding opponents) and a dynamic scoring system that rewards speed, creates a highly replayable and engaging social experience. The solution directly addresses the learning problem by being a project that is inherently fun to build, test, and share, providing a strong motivational pull to learn the underlying coding principles of game logic, multiplayer state management, and web deployment.

### **Target Users**

**Primary User Segment: The Learner (The Son)**

* **Profile:** An 11-year-old with an interest in gaming and technology, new to formal programming concepts.  
* **Behaviors:** Enjoys playing games, is curious about how things work, and is motivated by tangible results and fun. Learns best through hands-on, goal-oriented activities rather than abstract theory.  
* **Needs & Goals:** Needs a clear, exciting project goal to stay motivated. Wants to see the code they write have an immediate, visible effect on the game. Their primary goal is to have fun building a real game they can play with friends and family, and to understand the basics of how it works.

**Secondary User Segment: The Mentor & Players (The Father, Friends & Family)**

* **Profile:** A parent guiding the learning process, and friends/family who will be the first players.  
* **Behaviors:** The mentor facilitates the project, helps overcome technical hurdles, and learns alongside the primary user. Players will engage with the final product, providing feedback and a social context for the game.  
* **Needs & Goals:** The mentor needs a project with a clear scope and achievable steps. Their goal is to foster the learner's interest in coding in a collaborative and enjoyable way. Players need the game to be simple to access (via a web link) and intuitive to play.

### **Goals & Success Metrics**

**Business Objectives**

* **Primary Goal: Education & Collaboration:** Successfully build and deploy a complete, working game, providing a fun and engaging platform for the father-son team to learn core concepts of game development, JavaScript (with Phaser), and web hosting.  
* **Completion Goal:** Deliver a feature-complete Minimum Viable Product (MVP) as defined in this brief to a publicly accessible URL on Google Cloud.  
* **Engagement Goal:** Create a game that is genuinely fun and replayable, encouraging friends and family to play multiple rounds.

**User Success Metrics**

* **Replayability:** Players voluntarily choose to play more than one match (e.g., "Best of 3") in a single session.  
* **Intuitive Gameplay:** A new player can understand the objective and controls within the first 60 seconds of playing without needing external instructions.  
* **Player Engagement:** Players report feeling a sense of tension and excitement, especially as the treasure value depletes and the tempo increases.

**Key Performance Indicators (KPIs)**

* **Project Completion:** The MVP is successfully deployed and functional on a public Google Cloud URL.  
* **Feature Implementation:** 100% of defined MVP features (maze generation, multiplayer logic, scoring, 4 power-ups) are implemented and working.  
* **Player Session Length:** The average play session consists of at least a "Best of 3" match, indicating players are engaged enough to want to play again.  
* **Learner Competency:** The primary learner (the son) can independently explain the basic function of each major game component he helped build.

### **MVP Scope**

**Core Features (Must Have)**

* **Multiplayer Lobby:** A simple screen where up to 4 players can join a game session before it starts.  
* **Random Maze Generation:** The game must algorithmically generate a new, random maze for each round, ensuring a fair, solvable path from each player's start point to the center.  
* **Player Movement & Flashlight:** Implement basic player controls (up, down, left, right) and the core "flashlight" line-of-sight mechanic.  
* **Scoring System:** Implement the time-depleting treasure value (starting at 100\) and the proportional scoring for non-winners when a round ends.  
* **Power-Ups:** Implement all four discussed power-ups: Speed Boost, Brighter Flashlight, X-Ray Vision, and Blackout.  
* **Game Rounds:** Allow hosts to select the number of rounds (e.g., Best of 3, 5, or 10\) to determine the overall match winner.

**Out of Scope for MVP**

* Multiple maze themes (e.g., haunted forest, space station). The MVP will focus solely on the 'Cave' theme.  
* Advanced player customization (e.g., different character sprites, colors).  
* AI/bot opponents for single-player mode. The MVP is exclusively multiplayer.  
* Sound effects beyond the basic tempo-increasing beat.  
* Persistent user accounts or leaderboards.

MVP Success Criteria  
The MVP will be considered a success when a group of four players can successfully start a match, play a "Best of 3" series of rounds to completion, have their scores tallied correctly, and a final winner declared, all through a shared public URL.

### **Post-MVP Vision**

**Phase 2 Features**

* **Multiple Maze Themes:** Introduce new visual and potentially functional themes for the mazes, such as 'Haunted Forest', 'Space Station', or 'Ancient Dungeon'. Different themes could include unique obstacles or power-ups.  
* **Enhanced Sound Design:** Add a richer soundscape, including ambient sounds for each theme, power-up activation sounds, and effects for player actions.

**Long-term Vision**

* **Single-Player Mode with AI:** Develop AI-controlled opponents (bots) to allow for engaging single-player or practice modes.  
* **Persistent Leaderboards:** Implement a system for tracking player scores and rankings over time to foster long-term competition.

**Expansion Opportunities**

* **Custom Maze Builder:** A potential long-term feature where players can design and share their own mazes.  
* **Expanded Power-Up System:** Introduce a wider variety of more complex power-ups to add strategic depth.

### **Technical Considerations**

**Platform Requirements**

* **Target Platforms:** The primary target is modern desktop web browsers (Chrome, Firefox, Safari, Edge). The application should be responsive.  
* **Browser/OS Support:** While it should function on mobile browsers, specific mobile-first optimizations are not an MVP requirement. The core experience will be designed for desktop play.  
* **Performance Requirements:** The game should run smoothly at a consistent frame rate on an average consumer laptop without requiring dedicated graphics hardware.

**Technology Preferences**

* **Frontend / Game Engine:** The project will use **Phaser** for the core game logic, rendering, and asset management.  
* **Web Framework / Build Tool:** The Phaser game will be embedded within a web application driven by **Vite or Next.js**.  
* **Backend (for Multiplayer):** A server-side component will be necessary to manage multiplayer game state. A **Node.js** server is the recommended starting point due to its JavaScript ecosystem alignment.  
* **Hosting/Infrastructure:** The final application will be deployed and hosted on **Google Cloud**.

**Architecture Considerations**

* **Repository Structure:** A monorepo containing both the frontend client and backend server is a strong possibility to simplify development and code sharing.  
* **Service Architecture:** A client-server model is required. The server will act as the authoritative source for game state (player positions, maze layout, score) to prevent cheating and ensure consistency across all players. Real-time communication will likely be handled via WebSockets.  
* **Integration Requirements:** The Phaser client will need to communicate in real-time with the backend server to send player inputs and receive game state updates.  
* **Security/Compliance:** Not applicable for this educational project, beyond basic server security practices.

### **Constraints & Assumptions**

**Constraints**

* **Timeline:** This is an educational project driven by learning, not a commercial deadline. The timeline is flexible.  
* **Budget:** The project must be executed with zero budget, relying on free tiers of services (e.g., Google Cloud Free Tier) for hosting.  
* **Team:** The development team consists of two people (father and son) with a primary goal of learning. This constrains the complexity of features that can be realistically implemented.  
* **Technology:** The project is constrained to using Phaser, a JavaScript/TypeScript web framework (like Vite or Next.js), and Node.js for any backend services, as these are the chosen technologies for the learning objective.

**Key Assumptions**

* It is assumed that a randomly generated maze with a guaranteed solvable path for all four players is technically feasible within the Phaser framework.  
* We assume that real-time multiplayer state synchronization for up to four players is achievable with acceptable latency using a standard Node.js server with WebSockets on a free-tier hosting plan.  
* It is assumed that the proportional scoring mechanic (calculating distance from the center) is computationally inexpensive and will not cause performance issues.

### **Risks & Open Questions**

**Key Risks**

* **Learning Curve:** The primary risk is underestimating the learning curve for Phaser or multiplayer networking, potentially leading to slow progress or frustration. **Mitigation:** Focus on one concept at a time, celebrate small wins, and utilize community resources (tutorials, forums).  
* **Scope Creep:** The project could become demotivating if too many "cool ideas" are added to the MVP, delaying the satisfaction of a finished product. **Mitigation:** Strictly adhere to the defined MVP scope and move all new ideas to the "Post-MVP Vision" section.  
* **Multiplayer Complexity:** Real-time networking is inherently complex. Issues with latency, state synchronization, and fairness can be difficult to debug. **Mitigation:** Start with the simplest possible networking model, perhaps getting just two players to see each other move before adding more complex game logic.

**Open Questions**

* What is the most effective algorithm for generating a fair maze for four players that balances randomness with equal path difficulty?  
* What is the best way to host a persistent Node.js WebSocket server within the constraints of the Google Cloud Free Tier?  
* How will the game handle player disconnections and reconnections mid-round? (For MVP, this may be considered out of scope).

### **Next Steps**

**Immediate Actions**

1. Finalize and approve this Project Brief.  
2. Hand off this brief to the Product Manager (PM) to begin the creation of a detailed Product Requirements Document (PRD).

PM Handoff  
This Project Brief provides the full context for the "Multiplayer Maze Racer" project. The next step is to use this document as the foundation to create a comprehensive PRD. The PM should work with the stakeholders (the father-son team) to translate these goals and scope definitions into detailed functional and non-functional requirements, epics, and user stories.