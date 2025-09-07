# **5. Core Workflows**

These diagrams illustrate the real-time communication between the client and server for key gameplay events.

## **5.1. Player Joins Game**

sequenceDiagram  
    participant Client as Player's Client (Browser)  
    participant Server as Colyseus Server (Cloud Run)

    Client-\>\>Server: Attempts to join room with name/ID  
    Server-\>\>Server: onJoin(): Creates new Player instance  
    Server-\>\>Server: Adds player to GameState.players  
    Server--\>\>Client: Sends full GameState to new client  
    Note over Server,Client: Server automatically broadcasts state\<br/\>change to all existing clients  
    Client-\>\>Client: onStateChange(): Renders all players and game world

## **5.2. Player Moves**

sequenceDiagram  
    participant Client as Player's Client (Phaser)  
    participant Server as Colyseus Server (Cloud Run)

    Client-\>\>Client: User presses movement key  
    Client-\>\>Server: Sends "move" message with direction  
    Server-\>\>Server: onMessage("move"): Validates move (e.g., no wall collision)  
    alt If move is valid  
        Server-\>\>Server: Updates player's x, y in GameState  
    end  
    Note over Server,Client: Colyseus automatically sends the updated\<br/\>player position to all clients  
    Client-\>\>Client: onStateChange(): Updates the player sprite's position on screen

## **5.3. Player Uses Power-Up**

sequenceDiagram  
    participant Client as Player's Client (Phaser)  
    participant Server as Colyseus Server (Cloud Run)

    Client-\>\>Client: User presses spacebar to activate power-up  
    Client-\>\>Server: Sends "usePowerUp" message  
    Server-\>\>Server: onMessage("usePowerUp"): Validates player has power-up  
    Server-\>\>Server: Applies power-up effect (e.g., changes player state, sends messages)  
    Server-\>\>Server: Sets player's currentPowerUp to null  
    Note over Server,Client: GameState changes are broadcast to all clients  
    Client-\>\>Client: onStateChange(): Client-side visual effects for power-up are triggered