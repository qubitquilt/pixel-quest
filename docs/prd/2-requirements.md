# **2. Requirements**

### **2.1. Functional Requirements**

* **FR1:** The system shall provide a simple lobby where a player can start a game and receive a shareable link for up to 3 other players to join.  
* **FR2:** For each round, the server must generate a new, random maze that is guaranteed to be solvable from each of the 4 player starting positions.  
* **FR3:** Players must be able to control a character within the maze using keyboard inputs (up, down, left, right).  
* **FR4:** Each player's view of the maze must be restricted by a "flashlight" mechanic, limiting their line of sight.  
* **FR5:** A round immediately concludes when the first player's character reaches the treasure at the center of the maze.  
* **FR6:** The winner of the round shall be awarded points based on a treasure value that starts at 100 and decreases over time at an accelerating rate.  
* **FR7:** Upon round completion, non-winning players shall be awarded points proportional to their remaining optimal distance to the treasure, based on the winner's score.  
* **FR8:** Players shall be able to pick up and use four distinct power-ups: Speed Boost, Brighter Flashlight, X-Ray Vision, and Blackout.  
* **FR9:** The game host shall be able to select the number of rounds for a match (e.g., Best of 3, 5, or 10).

### **2.2. Non-Functional Requirements**

* **NFR1:** The game must be playable in a modern desktop web browser without any required downloads or installations.  
* **NFR2:** All hosting and backend services must operate within the free-tier limits of Google Cloud.  
* **NFR3:** The game must maintain a smooth framerate on typical consumer laptop hardware.
