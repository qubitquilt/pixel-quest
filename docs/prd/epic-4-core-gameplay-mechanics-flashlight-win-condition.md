# **Epic 4: Core Gameplay Mechanics (Flashlight & Win Condition)**

**Epic Goal:** To implement the core "flashlight" visibility mechanic and the logic for ending a round when a winner is determined.

* **Story 4.1:** As a developer, I want to implement a "fog of war" or mask effect in Phaser to create the flashlight visibility cone for the local player.  
* **Story 4.2:** As a player, I want my flashlight cone to be visible to other players, and I want to see theirs, so we have shared visibility on the map.  
* **Story 4.3:** As a server, I want to detect when a player's position overlaps with the treasure's position to identify the round winner.  
* **Story 4.4:** As a server, I want to broadcast a "Round Over" event when a winner is found so that all clients know to end the round.
