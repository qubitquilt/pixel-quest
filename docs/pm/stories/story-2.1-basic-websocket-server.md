# **Story 2.1: Basic WebSocket Server**

## **Status**

* \[x\] Draft  
* \[ \] Approved  
* \[ \] InProgress  
* \[ \] Review  
* \[ \] Done

## **Story**

As a developer,  
I want to set up a WebSocket server using Socket.IO,  
so that game clients can establish a persistent, real-time connection.

## **Acceptance Criteria**

1. The Node.js server has Socket.IO integrated.  
2. The server can accept incoming WebSocket connections from clients.  
3. The server can log a message when a client connects and disconnects.  
4. The server maintains a list of all currently connected clients.

## **Tasks / Subtasks**

* \[ \] Add socket.io as a dependency to the server package.  
* \[ \] Modify server/src/index.js to initialize Socket.IO and attach it to the Express server.  
* \[ \] Implement a connection event listener for Socket.IO.  
* \[ \] Inside the connection listener, log the new client's ID to the console.  
* \[ \] Implement a disconnect event listener for each connected client and log their disconnection.  
* \[ \] Create a server-side data structure (e.g., an object or Map) to store information about connected clients.  
* \[ \] Add logic to add clients to this structure on connection and remove them on disconnection.

## **Dev Notes**

This is the first step in building the multiplayer functionality. This story focuses solely on the backend, establishing the real-time communication channel.

### **Architecture Alignment**

* **Connection Manager**: This is the implementation of the Connection Manager backend component.  
* **Authoritative Server**: This story lays the groundwork for the server to manage the game state by tracking all connected players.

### **Tech Stack**

* **Backend Runtime**: Node.js (20.x LTS)  
* **Web Server**: Express (4.x)  
* **Real-time Engine**: Socket.IO (4.x)

## **Testing**

* Start the server.  
* Use a simple client (can be a separate test script or even a browser's developer console) to connect to the WebSocket server.  
* Verify that the server console logs a "client connected" message with a unique ID.  
* Verify that the server's internal list of clients now contains the new client.  
* Disconnect the client.  
* Verify that the server console logs a "client disconnected" message.  
* Verify that the client is removed from the server's list.

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