# **Story 2.3: Multiplayer Character Spawning & State Sync**

## **Status**

* \[x\] Draft  
* \[ \] Approved  
* \[ \] InProgress  
* \[ \] Review  
* \[ \] Done

## **Story**

As a player,  
I want to see other players' characters in the game world,  
so that we can explore together.

## **Acceptance Criteria**

1. When a player connects, the server sends them the current state of all other players (position, character class).  
2. The client renders sprites for all other connected players at their correct positions.  
3. When a new player joins, the server broadcasts a "player joined" event to all existing clients, who then render the new player's character.  
4. When a player disconnects, the server broadcasts a "player left" event, and their sprite is removed from all other clients' games.

## **Tasks / Subtasks**

* \[ \] On the server, when a player connects, gather the state of all already-connected players and send it to the new player via a currentPlayers event.  
* \[ \] On the client, create a data structure to store information about other players.  
* \[ \] On the client, handle the currentPlayers event: loop through the player data and create a Player sprite for each one.  
* \[ \] On the server, after sending the currentPlayers data, broadcast a newPlayer event to all *other* clients, sending the new player's data.  
* \[ \] On the client, handle the newPlayer event by creating a sprite for the newly joined player.  
* \[ \] On the server, enhance the disconnect listener to broadcast a playerDisconnected event to all remaining clients, sending the ID of the player who left.  
* \[ \] On the client, handle the playerDisconnected event by finding and removing the corresponding player sprite.

## **Dev Notes**

This story makes the multiplayer aspect visible. Players can now see each other in the game world. Movement is not yet synchronized.

### **Architecture Alignment**

* **Authoritative Server**: The server is now responsible for telling clients who is in the game. This reinforces its role as the source of truth for game state.  
* **Game State Manager**: The manager is now responsible for tracking the state (position, class) of all players in the session.  
* **API Specification**: Implements the currentPlayers, newPlayer, and playerDisconnected server-to-client events.

### **Tech Stack**

* **Real-time Engine**: Socket.IO (4.x)

## **Testing**

* Start server, launch client 1\.  
* Launch client 2\. Verify that client 1's character appears on client 2's screen, and client 2's character appears on client 1's screen.  
* Launch client 3\. Verify its character appears on clients 1 and 2, and their characters appear on client 3\.  
* Close client 2\. Verify its character sprite is removed from the screens of clients 1 and 3\.

## **Change Log**

| Date | Version | Description | Author |
| :---- | :---- | :---- | :---- |
| 2025-09-01 | 1.0 | Initial draft | Scrum Master |

## **Dev Agent Record**

### **Agent Model Used**

*TBD*

### **Completion Notes List**

*TBD*

### **File List**

*TBD*

## **QA Results**

*TBD*