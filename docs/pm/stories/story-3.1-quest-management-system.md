# **Story 3.1: Quest Management System**

## **Status**

* \[x\] Draft  
* \[ \] Approved  
* \[ \] InProgress  
* \[ \] Review  
* \[ \] Done

## **Story**

As a developer,  
I want a system to define and track quest states,  
so that I can create and manage quests for the players.

## **Acceptance Criteria**

1. A data structure (e.g., JSON object) is created on the server to define quests, including their objectives, states (e.g., "not started", "in progress", "completed"), and any associated data.  
2. The server can track the state of each main quest for the party.  
3. A basic UI element is added to the Main Menu to display the current status of the main quests.

## **Tasks / Subtasks**

* \[ \] On the server, create a file (e.g., quests.json) to define the structure of the game's quests.  
* \[ \] In the server-side GameStateManager, add a quests object to the session state to track the progress of each quest for the current party.  
* \[ \] When a new game session is created, initialize the quest states (e.g., all to "not started").  
* \[ \] On the client, create a new "Quest Log" tab or screen within the main menu UI.  
* \[ \] When the client connects, the server should send the current quest status along with the other game state.  
* \[ \] The client's Quest Log UI should render the titles and statuses of the available quests based on the data from the server.

## **Dev Notes**

This story sets up the backend and UI foundations for the entire questing system. It doesn't implement a full quest, just the system for managing them.

### **Architecture Alignment**

* **Game Logic Engine**: The quest state management is a major new piece of the backend's game logic.  
* **Data Models**: Introduces the Quest data model.  
* **Database Schema**: The quest progress will need to be stored in Firestore, so this informs the schema design.

### **Tech Stack**

* **Backend**: Node.js, Socket.IO  
* **Frontend**: PixiJS (for the UI)

## **Testing**

* Verify that after starting a server and connecting a client, the server's game state includes a list of quests with their initial status.  
* On the client, open the main menu and navigate to the Quest Log.  
* Verify that the UI correctly displays the quests and their "not started" status.

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