import "reflect-metadata";
import { Room, Client } from "colyseus";
import { GameState, Player, Maze } from "shared/types";

export class MazeRaceRoom extends Room<GameState> {
  onCreate(options: any) {
    this.state = new GameState();
    this.state.root = this.state;
  
    if (process.env.NODE_ENV === 'development' && !process.env.PLAYWRIGHT_TEST) {
      console.log("MazeRaceRoom created!", options);
    }
  
    this.onMessage('startGame', this.onStartGame.bind(this));

    this.onMessage('move', (client: Client, message: any) => {
      const { dx, dy } = message;
      const player = this.state.players.get(client.sessionId);
      if (player && dx !== undefined && dy !== undefined) {
        const newX = player.x + dx;
        const newY = player.y + dy;
        // Validate bounds
        if (newX >= 0 && newX < this.state.mazeWidth && newY >= 0 && newY < this.state.mazeHeight) {
          // Validate against grid (1 = path)
          if (this.state.grid[newY][newX] === 1) {
            player.x = newX;
            player.y = newY;
          }
        }
        // State change broadcasts automatically via Colyseus
      }
    });
  }

  onJoin(client: Client, options: any) {
    if (process.env.NODE_ENV === 'development' && !process.env.PLAYWRIGHT_TEST) {
      console.log(client.sessionId, "joined!");
    }
    const player = new Player();
    player.id = client.sessionId;
    player.name = options.name || "Player";
    player.x = 1;
    player.y = 0;
    player.startX = 1;
    player.startY = 0;

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    if (process.env.NODE_ENV === 'development' && !process.env.PLAYWRIGHT_TEST) {
      console.log("MazeRaceRoom.onLeave called for client:", client.sessionId, "consented:", consented);
      console.log("Players after leave:", Array.from(this.state.players.values() as Iterable<Player>).map((p: Player) => p.name));
    }
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    if (process.env.NODE_ENV === 'development' && !process.env.PLAYWRIGHT_TEST) {
      console.log("room", this.roomId, "disposing...");
    }
  }

  onStartGame(client: Client, message: any) {
    if (process.env.NODE_ENV === 'development' && !process.env.PLAYWRIGHT_TEST) {
      console.log(`${client.sessionId} requested to start game`);
    }
    
    // Identify host as the first player who joined
    const hostSessionId = Array.from(this.state.players.keys())[0];
    const isHost = client.sessionId === hostSessionId;
    const hasEnoughPlayers = this.state.players.size >= 2;
    
    if (isHost && hasEnoughPlayers) {
      if (process.env.NODE_ENV === 'development' && !process.env.PLAYWRIGHT_TEST) {
        console.log('Starting game - host request with enough players');
      }
      this.state.roundState = 'playing';
      
      // Generate maze when game starts
      const maze = this.generateMaze();
      this.state.mazeWidth = maze.width;
      this.state.mazeHeight = maze.height;
      this.state.grid = maze.grid.map((row: number[]) => [...row]); // Deep copy for Colyseus
      
      // Set player start positions (all players start at entrance)
      this.state.players.forEach((player: Player) => {
        player.startX = 1; // Entrance position
        player.startY = 0;
        player.x = 1;
        player.y = 0;
      });
      
      this.broadcast('gameStarted');
      if (process.env.NODE_ENV === 'development' && !process.env.PLAYWRIGHT_TEST) {
        console.log('Game started with maze generated and state updated for Colyseus sync');
      }
    } else {
      if (process.env.NODE_ENV === 'development' && !process.env.PLAYWRIGHT_TEST) {
        console.log(`Start game rejected: isHost=${isHost}, players=${this.state.players.size}`);
      }
    }
  }

  onMove(client: Client, message: any) {
    const { dx, dy } = message;
    const player = this.state.players.get(client.sessionId);
    if (player && dx !== undefined && dy !== undefined) {
      const newX = player.x + dx;
      const newY = player.y + dy;
      // Validate bounds
      if (newX >= 0 && newX < this.state.mazeWidth && newY >= 0 && newY < this.state.mazeHeight) {
        // Validate against grid (1 = path)
        if (this.state.grid[newY][newX] === 1) {
          player.x = newX;
          player.y = newY;
        }
      }
    }
    // State change broadcasts automatically via Colyseus
  }

  private generateMaze(): Maze {
    const width = 21;
    const height = 21;
    
    // Initialize maze with walls (0 = wall, 1 = path)
    const grid: number[][] = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => 0)
    );
    
    // Track visited cells
    const visited: boolean[][] = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => false)
    );
    
    // Directions: up, right, down, left
    const directions = [
      { dr: -2, dc: 0 }, // up
      { dr: 0, dc: 2 },  // right
      { dr: 2, dc: 0 },  // down
      { dr: 0, dc: -2 }  // left
    ];
    
    function carvePath(row: number, col: number): void {
      visited[row][col] = true;
      grid[row][col] = 1; // Mark as path
      
      // Get random order of directions
      const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
      
      for (const dir of shuffledDirections) {
        const newRow = row + dir.dr;
        const newCol = col + dir.dc;
        
        // Check bounds and if unvisited
        if (
          newRow >= 0 && newRow < height &&
          newCol >= 0 && newCol < width &&
          !visited[newRow][newCol]
        ) {
          // Remove wall between current and new cell
          const wallRow = row + Math.floor(dir.dr / 2);
          const wallCol = col + Math.floor(dir.dc / 2);
          grid[wallRow][wallCol] = 1;
          
          // Recurse to new cell
          carvePath(newRow, newCol);
        }
      }
    }
    
    // Start carving from top-left corner (1,1) for proper wall structure
    const startRow = 1;
    const startCol = 1;
    carvePath(startRow, startCol);
    
    // Ensure entrance and exit are open
    grid[0][1] = 1; // Entrance at top-left
    grid[height - 1][width - 2] = 1; // Exit at bottom-right
    
    return { grid, width, height };
  }
}
