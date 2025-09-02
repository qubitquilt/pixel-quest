# **Technical Assumptions**

### **Repository Structure: Monorepo**

* **Decision:** The project will be housed in a single monorepo. This repository will contain both the game client code and the backend server code.  
* **Rationale:** This approach simplifies dependency management and ensures that the client and server can easily share code (e.g., for game state models or constants). It makes coordinated changes much easier to manage, which is crucial for a small team.

### **Service Architecture**

* **Decision:** The initial architecture will be a simple **Monolith**. A single Node.js server application will handle all backend responsibilities, including managing player connections, synchronizing game state, and broadcasting events.  
* **Rationale:** A monolith is the fastest and most straightforward way to build our MVP. It avoids the unnecessary complexity of a microservices architecture, allowing us to focus on core gameplay features first.

### **Testing Requirements**

* **Decision:** The project will require both **Unit and Integration tests**.  
* **Rationale:** Unit tests will ensure individual functions and components (like a combat calculator or a loot generator) work correctly in isolation. Integration tests will be critical for verifying the communication layer between the game client and the backend server, ensuring a stable multiplayer experience.

### **Additional Technical Assumptions and Requests**

* **Real-time Communication:** The multiplayer functionality must be built using **WebSockets**. The Socket.IO library is recommended for its robust features and ease of use in managing real-time, bi-directional communication between the clients and the server.  
* **Game State Authority:** The backend server will be the single source of truth (authoritative) for the core game state to prevent cheating and ensure consistency across all players. Clients will send their intended actions to the server, and the server will validate them and broadcast the new state back to all clients.