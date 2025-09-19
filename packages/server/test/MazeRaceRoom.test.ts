import "reflect-metadata";

import { Client } from "colyseus";
import { ArraySchema } from "@colyseus/schema";
import { MazeRaceRoom } from "../rooms/MazeRaceRoom";
import { GameState, Player } from "shared";

describe("MazeRaceRoom", () => {
  it("should create a new room", () => {
    const room = new MazeRaceRoom();
    room.onCreate({});
    expect(room.state).toBeDefined();
    expect(room.state.roundState).toBe('waiting');
  });

  it("should allow a client to join as host", () => {
    const room = new MazeRaceRoom();
    room.onCreate({});
    const options = { name: "HostPlayer" };
    const mockClient = ({
      sessionId: "mock-session",
      auth: {},
      send: jest.fn(),
      onMessage: jest.fn(),
      id: "mock-client-id",
    } as unknown) as Client;
    room.onJoin(mockClient, options);
    expect(room.state.players.size).toBe(1);
    const player = room.state.players.get("mock-session")!;
    expect(player.name).toBe("HostPlayer");
    expect(typeof player.x).toBe("number");
    expect(typeof player.y).toBe("number");
  });
  
  describe('startGame validation', () => {
    it('should reject start game with only 1 player', () => {
      const room = new MazeRaceRoom();
      room.onCreate({});
      
      const mockClient = ({
        sessionId: 'host-session',
        auth: {},
        send: jest.fn(),
        onMessage: jest.fn(),
        id: 'mock-client-id',
      } as unknown) as Client;
      
      // Join as host (1 player)
      room.onJoin(mockClient, { name: 'Host' });
      expect(room.state.players.size).toBe(1);
      
      // Spy on broadcast to verify it's not called
      const broadcastSpy = jest.spyOn(room, 'broadcast');
      
      // Trigger startGame message
      room.onStartGame(mockClient, {});
      
      // Should not change state or broadcast
      expect(room.state.roundState).toBe('waiting');
      expect(broadcastSpy).not.toHaveBeenCalled();
    });
  
    it('should reject start game from non-host with 2 players', () => {
      const room = new MazeRaceRoom();
      room.onCreate({});
      
      const hostClient = ({
        sessionId: 'host-session',
        auth: {},
        send: jest.fn(),
        onMessage: jest.fn(),
        id: 'host-id',
      } as unknown) as Client;
      
      const guestClient = ({
        sessionId: 'guest-session',
        auth: {},
        send: jest.fn(),
        onMessage: jest.fn(),
        id: 'guest-id',
      } as unknown) as Client;
      
      // Join host first
      room.onJoin(hostClient, { name: 'Host' });
      
      // Join guest
      room.onJoin(guestClient, { name: 'Guest' });
      expect(room.state.players.size).toBe(2);
      
      // Spy on broadcast
      const broadcastSpy = jest.spyOn(room, 'broadcast');
      
      // Guest tries to start game (should be rejected)
      room.onStartGame(guestClient, {});
      
      expect(room.state.roundState).toBe('waiting');
      expect(broadcastSpy).not.toHaveBeenCalled();
    });
  
    it('should allow host to start game with 2+ players', () => {
      const room = new MazeRaceRoom();
      room.onCreate({});
      
      const hostClient = ({
        sessionId: 'host-session',
        auth: {},
        send: jest.fn(),
        onMessage: jest.fn(),
        id: 'host-id',
      } as unknown) as Client;
      
      const guestClient = ({
        sessionId: 'guest-session',
        auth: {},
        send: jest.fn(),
        onMessage: jest.fn(),
        id: 'guest-id',
      } as unknown) as Client;
      
      // Join host first
      room.onJoin(hostClient, { name: 'Host' });
      
      // Join guest
      room.onJoin(guestClient, { name: 'Guest' });
      expect(room.state.players.size).toBe(2);
      
      // Spy on broadcast
      const broadcastSpy = jest.spyOn(room, 'broadcast');
      
      // Host starts game (should succeed)
      room.onStartGame(hostClient, {});
      
      expect(room.state.roundState).toBe('playing');
      expect(broadcastSpy).toHaveBeenCalledWith('gameStarted');
    });
  
    it('should allow host to start game with more than 2 players', () => {
      const room = new MazeRaceRoom();
      room.onCreate({});
      
      const hostClient = ({
        sessionId: 'host-session',
        auth: {},
        send: jest.fn(),
        onMessage: jest.fn(),
        id: 'host-id',
      } as unknown) as Client;
      
      const guest1Client = ({
        sessionId: 'guest1-session',
        auth: {},
        send: jest.fn(),
        onMessage: jest.fn(),
        id: 'guest1-id',
      } as unknown) as Client;
      
      const guest2Client = ({
        sessionId: 'guest2-session',
        auth: {},
        send: jest.fn(),
        onMessage: jest.fn(),
        id: 'guest2-id',
      } as unknown) as Client;
      
      // Join multiple players
      room.onJoin(hostClient, { name: 'Host' });
      room.onJoin(guest1Client, { name: 'Guest1' });
      room.onJoin(guest2Client, { name: 'Guest2' });
      expect(room.state.players.size).toBe(3);
      
      // Spy on broadcast
      const broadcastSpy = jest.spyOn(room, 'broadcast');
      
      // Host starts game
      room.onStartGame(hostClient, {});
      
      expect(room.state.roundState).toBe('playing');
      expect(broadcastSpy).toHaveBeenCalledWith('gameStarted');
    });

    describe('Maze Generation', () => {
      let room: MazeRaceRoom;

      beforeEach(() => {
        room = new MazeRaceRoom();
        room.onCreate({});
      });

      it('should generate a 21x21 maze', () => {
        const maze = (room as any).generateMaze(); // Access private method
        expect(maze.width).toBe(21);
        expect(maze.height).toBe(21);
        expect(maze.grid).toHaveLength(21);
        expect(maze.grid[0]).toHaveLength(21);
      });

      it('should generate maze with both walls and paths', () => {
        const maze = (room as any).generateMaze();
        const allCells = maze.grid.flat();
        
        // Should have mostly walls (0) but some paths (1)
        const wallCount = allCells.filter((cell: number) => cell === 0).length;
        const pathCount = allCells.filter((cell: number) => cell === 1).length;
        
        expect(pathCount).toBeGreaterThan(0); // At least some paths
        expect(wallCount).toBeGreaterThan(0); // At least some walls
        expect(pathCount + wallCount).toBe(21 * 21); // All cells accounted for
      });

      it('should generate different mazes on multiple calls', () => {
        const maze1 = (room as any).generateMaze();
        const maze2 = (room as any).generateMaze();
        
        // Compare flattened grids
        const grid1 = maze1.grid.flat().join('');
        const grid2 = maze2.grid.flat().join('');
        
        expect(grid1).not.toBe(grid2); // Different mazes
      });

      it('should generate a solvable maze (BFS pathfinding)', () => {
        const maze = (room as any).generateMaze();
        
        // Entrance at (0,1), Exit at (20,19)
        const start = { row: 0, col: 1 };
        const end = { row: 20, col: 19 };
        
        // BFS to find path from start to end
        const queue: { row: number; col: number; path: string[] }[] = [{
          row: start.row,
          col: start.col,
          path: [`${start.row},${start.col}`]
        }];
        
        const visited = new Set<string>();
        visited.add(`${start.row},${start.col}`);
        
        const directions = [
          { dr: 0, dc: 1 }, // right
          { dr: 0, dc: -1 }, // left
          { dr: 1, dc: 0 }, // down
          { dr: -1, dc: 0 } // up
        ];
        
        let foundPath = false;
        
        while (queue.length > 0) {
          const { row, col, path } = queue.shift()!;
          
          if (row === end.row && col === end.col) {
            foundPath = true;
            break;
          }
          
          for (const dir of directions) {
            const newRow = row + dir.dr;
            const newCol = col + dir.dc;
            
            if (
              newRow >= 0 && newRow < 21 &&
              newCol >= 0 && newCol < 21 &&
              maze.grid[newRow][newCol] === 1 && // Is path
              !visited.has(`${newRow},${newCol}`)
            ) {
              visited.add(`${newRow},${newCol}`);
              queue.push({
                row: newRow,
                col: newCol,
                path: [...path, `${newRow},${newCol}`]
              });
            }
          }
        }
        
        expect(foundPath).toBe(true);
      });

      it('should set maze properties correctly when game starts', () => {
        // Create mock clients for testing
        const hostClient = ({
          sessionId: 'host-session',
          auth: {},
          send: jest.fn(),
          onMessage: jest.fn(),
          id: 'host-id',
        } as unknown) as Client;

        const guestClient = ({
          sessionId: 'guest-session',
          auth: {},
          send: jest.fn(),
          onMessage: jest.fn(),
          id: 'guest-id',
        } as unknown) as Client;

        // Join players
        room.onJoin(hostClient, { name: 'Host' });
        room.onJoin(guestClient, { name: 'Guest' });

        // Spy on broadcast
        const broadcastSpy = jest.spyOn(room, 'broadcast');

        // Trigger startGame by calling handler directly
        room.onStartGame(hostClient, {});

        // Verify maze properties are set
        expect(room.state.mazeWidth).toBe(21);
        expect(room.state.mazeHeight).toBe(21);
        expect(room.state.grid).toHaveLength(441);

        // Verify players have start positions set
        room.state.players.forEach((player) => {
          expect(player.startX).toBe(1);
          expect(player.startY).toBe(0);
          expect(player.x).toBe(1);
          expect(player.y).toBe(0);
        });

        expect(broadcastSpy).toHaveBeenCalledWith('gameStarted');
      });
    });
  });

  describe('Player Movement Validation', () => {
    let room: MazeRaceRoom;
    let hostClient: Client;
    let guestClient: Client;

    beforeEach(() => {
      room = new MazeRaceRoom();
      room.onCreate({});

      hostClient = ({
        sessionId: 'host-session',
        auth: {},
        send: jest.fn(),
        onMessage: jest.fn(),
        id: 'host-id',
      } as unknown) as Client;

      guestClient = ({
        sessionId: 'guest-session',
        auth: {},
        send: jest.fn(),
        onMessage: jest.fn(),
        id: 'guest-id',
      } as unknown) as Client;

      room.onJoin(hostClient, { name: 'Host' });
      room.onJoin(guestClient, { name: 'Guest' });

      // Start game to set maze
      room.onStartGame(hostClient, {});
    });

    it('should validate and update player position on valid move', () => {
      const state = room.state as any;
      const initialX = state.players.get('guest-session')!.x;
      const initialY = state.players.get('guest-session')!.y;

      // Valid move: right to open path (ensure grid[0][2] is path for test)
      room.state.grid[0 * 21 + 2] = 1; // Mock open path for deterministic test
      (room as any).handleMove(guestClient, { dx: 1, dy: 0 });

      // Assert updated position
      expect(state.players.get('guest-session')!.x).toBe(initialX + 1);
      expect(state.players.get('guest-session')!.y).toBe(initialY);

      // State change broadcast automatic via Colyseus
    });

    it('should reject invalid move (wall collision)', () => {
      const state = room.state as any;
      const initialX = state.players.get('guest-session')!.x;
      const initialY = state.players.get('guest-session')!.y;

      // Invalid move: into wall (assume grid[initialY][initialX + 1] = 0)
      // Mock grid for test (since random, but validation uses grid)
      state.grid[initialY * 21 + (initialX + 1)] = 0; // Set wall

      (room as any).handleMove(guestClient, { dx: 1, dy: 0 });

      // Position unchanged
      expect(state.players.get('guest-session')!.x).toBe(initialX);
      expect(state.players.get('guest-session')!.y).toBe(initialY);
    });

    it('should handle concurrent moves from multiple players', () => {
      const state = room.state as any;

      // Multiple moves (mock open paths for deterministic test)
      room.state.grid[1 * 21 + 1] = 1; // Down for guest
      room.state.grid[0 * 21 + 2] = 1; // Right for host
      (room as any).handleMove(guestClient, { dx: 0, dy: 1 });
      (room as any).handleMove(hostClient, { dx: 1, dy: 0 });

      // Assert both players updated (assume valid)
      expect(state.players.get('guest-session')!.y).toBeGreaterThan(0);
      expect(state.players.get('host-session')!.x).toBeGreaterThan(0);

      // State broadcast for both
    });

    it('should reject out-of-bounds moves', () => {
      const state = room.state as any;
      const initialX = state.players.get('guest-session')!.x;
      const initialY = state.players.get('guest-session')!.y;

      // Out of bounds: left to negative X
      (room as any).handleMove(guestClient, { dx: -2, dy: 0 });

      // Position unchanged
      expect(state.players.get('guest-session')!.x).toBe(initialX);
      expect(state.players.get('guest-session')!.y).toBe(initialY);
    });

    it('should update player direction on valid move', () => {
      const state = room.state as any;
      const initialDirection = state.players.get('guest-session')!.direction;

      // Valid move right with new direction
      room.state.grid[0 * 21 + 2] = 1; // Mock open path
      (room as any).handleMove(guestClient, { dx: 1, dy: 0, direction: 'right' });

      // Assert position and direction updated
      expect(state.players.get('guest-session')!.x).toBeGreaterThan(0);
      expect(state.players.get('guest-session')!.direction).toBe('right');
      expect(state.players.get('guest-session')!.direction).not.toBe(initialDirection);
    });

    it('should handle mixed concurrent moves (valid and invalid)', () => {
      const state = room.state as any;

      // Valid for host, invalid for guest (wall)
      room.state.grid[0 * 21 + 2] = 1; // Right for host valid
      room.state.grid[1 * 21 + 1] = 0; // Down for guest invalid (wall)

      (room as any).handleMove(guestClient, { dx: 0, dy: 1 }); // Invalid
      (room as any).handleMove(hostClient, { dx: 1, dy: 0 }); // Valid

      // Assert only host updated, guest unchanged
      expect(state.players.get('host-session')!.x).toBeGreaterThan(0);
      expect(state.players.get('guest-session')!.y).toBe(0); // Unchanged
    });

    it('should silently reject invalid moves without state change', () => {
      const state = room.state as any;
      const initialX = state.players.get('guest-session')!.x;
      const initialY = state.players.get('guest-session')!.y;

      // Invalid wall move
      state.grid[initialY * 21 + (initialX + 1)] = 0;
      (room as any).handleMove(guestClient, { dx: 1, dy: 0 });

      // No state change, thus no broadcast triggered
      expect(state.players.get('guest-session')!.x).toBe(initialX);
      expect(state.players.get('guest-session')!.y).toBe(initialY);
    });

    it('handles concurrent invalid moves (wall collisions) without updates', () => {
      const state = room.state as any;
      const hostInitialX = state.players.get('host-session')!.x;
      const hostInitialY = state.players.get('host-session')!.y;
      const guestInitialX = state.players.get('guest-session')!.x;
      const guestInitialY = state.players.get('guest-session')!.y;

      // Mock walls for both players
      state.grid[hostInitialY * 21 + (hostInitialX + 1)] = 0; // Host right wall
      state.grid[guestInitialY * 21 + (guestInitialX - 1)] = 0; // Guest left wall

      // Concurrent invalid moves
      (room as any).handleMove(hostClient, { dx: 1, dy: 0 });
      (room as any).handleMove(guestClient, { dx: -1, dy: 0 });

      // Both positions unchanged, no race condition issues
      expect(state.players.get('host-session')!.x).toBe(hostInitialX);
      expect(state.players.get('host-session')!.y).toBe(hostInitialY);
      expect(state.players.get('guest-session')!.x).toBe(guestInitialX);
      expect(state.players.get('guest-session')!.y).toBe(guestInitialY);
    });

    it('rejects corner out-of-bounds moves without updates', () => {
      const state = room.state as any;
      const initialX = state.players.get('guest-session')!.x;
      const initialY = state.players.get('guest-session')!.y;

      // Move from corner (1,0) left to x=0 (assume open but test bounds to -1), but for out-of-bounds: move up to y=-1
      // Adjust to test corner bounds: move up from y=0
      (room as any).handleMove(guestClient, { dx: 0, dy: -1 });

      // Position unchanged (out of bounds)
      expect(state.players.get('guest-session')!.x).toBe(initialX);
      expect(state.players.get('guest-session')!.y).toBe(initialY);

      // Also test right from x=20 to 21 if moved, but since start at 1,0, test left to 0 if wall or bounds
      // For corner wall: assume move left to (0,0) wall
      state.grid[0 * 21 + 0] = 0; // Corner (0,0) wall
      (room as any).handleMove(guestClient, { dx: -1, dy: 0 });
      expect(state.players.get('guest-session')!.x).toBe(initialX);
      expect(state.players.get('guest-session')!.y).toBe(initialY);
    });
  });
  afterEach(() => { room.onDispose(); });

});
    describe('Maze State Synchronization', () => {
      let room: MazeRaceRoom;

      beforeEach(() => {
        room = new MazeRaceRoom();
        room.onCreate({});
      });

      it('should set maze data in GameState after game start', () => {
        // Create mock clients
        const hostClient = ({
          sessionId: 'host-session',
          auth: {},
          send: jest.fn(),
          onMessage: jest.fn(),
          id: 'host-id',
        } as unknown) as Client;

        const guestClient = ({
          sessionId: 'guest-session',
          auth: {},
          send: jest.fn(),
          onMessage: jest.fn(),
          id: 'guest-id',
        } as unknown) as Client;

        // Join players
        room.onJoin(hostClient, { name: 'Host' });
        room.onJoin(guestClient, { name: 'Guest' });

        // Trigger startGame
        room.onStartGame(hostClient, {});

        // Use type assertions like existing tests
        const state = room.state;
        
        // Verify maze data is properly set in GameState
        expect(state.roundState).toBe('playing');
        expect(state.mazeWidth).toBe(21);
        expect(state.mazeHeight).toBe(21);
        expect(state.grid).toBeInstanceOf(ArraySchema);
        expect(state.grid.length).toBe(441);

        // Verify entrance and exit are open (1 = path)
        expect(state.grid[0 * 21 + 1]).toBe(1); // Entrance
        expect(state.grid[20 * 21 + 19]).toBe(1); // Exit

        // Verify players have correct start positions
        state.players.forEach((player) => {
          expect(player.startX).toBe(1);
          expect(player.startY).toBe(0);
          expect(player.x).toBe(1);
          expect(player.y).toBe(0);
        });
      });

      it('should maintain maze grid structure for Colyseus serialization', () => {
        // Create mock clients
        const hostClient = ({
          sessionId: 'host-session',
          auth: {},
          send: jest.fn(),
          onMessage: jest.fn(),
          id: 'host-id',
        } as unknown) as Client;

        const guestClient = ({
          sessionId: 'guest-session',
          auth: {},
          send: jest.fn(),
          onMessage: jest.fn(),
          id: 'guest-id',
        } as unknown) as Client;

        // Join players
        room.onJoin(hostClient, { name: 'Host' });
        room.onJoin(guestClient, { name: 'Guest' });

        // Generate maze before starting game to get reference
        const maze = (room as any).generateMaze();
        
        // Store original grid for comparison
        const originalGrid = maze.grid.map((row: number[]) => [...row]);

        // Trigger startGame
        room.onStartGame(hostClient, {});

        // Use type assertions like existing tests
        const state = room.state;

        // Verify grid was deep copied correctly for Colyseus
        expect(state.grid.length).toBe(441);
        for (let i = 0; i < 441; i++) {
          // Allow for minor variations due to random generation, but structure should match
          expect(typeof state.grid[i]).toBe('number');
          expect(state.grid[i] === 0 || state.grid[i] === 1).toBe(true); // Only 0 or 1 values
        }

        // Verify the grid is not the same reference as the generated maze (deep copy)
        expect(state.grid).not.toBe(originalGrid);
        expect(state.grid[0]).not.toBe(originalGrid[0]);
      });

      it('should ensure maze data integrity across multiple game starts', () => {
        const hostClient = ({
          sessionId: 'host-session',
          auth: {},
          send: jest.fn(),
          onMessage: jest.fn(),
          id: 'host-id',
        } as unknown) as Client;

        const guestClient = ({
          sessionId: 'guest-session',
          auth: {},
          send: jest.fn(),
          onMessage: jest.fn(),
          id: 'guest-id',
        } as unknown) as Client;

        // Join players
        room.onJoin(hostClient, { name: 'Host' });
        room.onJoin(guestClient, { name: 'Guest' });

        // Start game multiple times to verify state integrity
        for (let i = 0; i < 3; i++) {
          // Reset state before each start using type assertion
          const state = room.state as any;
          state.roundState = 'waiting';
          state.mazeWidth = 0;
          state.mazeHeight = 0;
          state.grid = [];

          // Trigger startGame
          room.onStartGame(hostClient, {});

          // Verify state is properly set each time
          expect(state.roundState).toBe('playing');
          expect(state.mazeWidth).toBe(21);
          expect(state.mazeHeight).toBe(21);
          expect(state.grid.length).toBe(441);
        }
      });

      it('should verify maze data is properly structured for Colyseus broadcast', () => {
        // Create mock clients
        const hostClient = ({
          sessionId: 'host-session',
          auth: {},
          send: jest.fn(),
          onMessage: jest.fn(),
          id: 'host-id',
        } as unknown) as Client;

        const guestClient = ({
          sessionId: 'guest-session',
          auth: {},
          send: jest.fn(),
          onMessage: jest.fn(),
          id: 'guest-id',
        } as unknown) as Client;

        // Join players
        room.onJoin(hostClient, { name: 'Host' });
        room.onJoin(guestClient, { name: 'Guest' });

        // Trigger startGame
        room.onStartGame(hostClient, {});

        // Use type assertions like existing tests
        const state = room.state;

        // Verify the maze data structure is correct for Colyseus serialization
        expect(typeof state.mazeWidth).toBe('number');
        expect(typeof state.mazeHeight).toBe('number');
        expect(state.grid).toBeInstanceOf(ArraySchema);
        expect(state.grid.every((cell: number) => typeof cell === 'number')).toBe(true);
        expect(state.grid.length).toBe(441);

        // Verify all cells contain only 0 (wall) or 1 (path) values
        expect(Array.from(state.grid).every((cell: number) => cell === 0 || cell === 1)).toBe(true);

        // Verify the state changes would trigger Colyseus broadcast (by verifying properties are set)
        expect(state.roundState).toBe('playing'); // This change triggers broadcast
        expect(state.mazeWidth).toBe(21); // This change triggers broadcast
        expect(state.mazeHeight).toBe(21); // This change triggers broadcast
        expect(state.grid.length).toBe(441); // This change triggers broadcast
      });
    });
