import React from 'react';
import { render, screen } from '@testing-library/react';
import PhaserGame from '@/app/components/PhaserGame';

jest.mock('phaser', () => ({
  AUTO: 'AUTO',
  Game: jest.fn(() => ({
    scene: {
      start: jest.fn(),
      getScene: jest.fn(() => ({})),
    },
    destroy: jest.fn(),
  })),
  Scene: class MockScene {
    key: string;
    data: any;
    add: any;
    tweens: any;
    input: any;
    scale: any;
    grid: any;
    tileSize: number;
    range: number;
    coneAngle: number;
    playerX: number;
    playerY: number;
    direction: string;
    otherPlayers: Map<string, any>;
    light: any;
    visualCones: any;
    computeVisibleTilesFor: any;
    player: any;
    roundState: string;
    isMoving: boolean;
    room: any;
    moveSpeed: number;
    sessionId: string;
    // Pending sync properties for rejection test
    pendingExpectedX: number = 0;
    pendingExpectedY: number = 0;
    pendingOldX: number = 0;
    pendingOldY: number = 0;
    isPendingSync: boolean = false;
    otherPlayerSprites: Map<string, any>;
    
    constructor(config: any) {
      this.key = config?.key || 'MazeScene';
      this.data = {};
      this.add = {
        graphics: jest.fn(() => ({
          fillStyle: jest.fn().mockReturnThis(),
          fillRect: jest.fn().mockReturnThis(),
          setDepth: jest.fn().mockReturnThis(),
          clear: jest.fn().mockReturnThis(),
        })),
        rectangle: jest.fn(() => ({
          setOrigin: jest.fn().mockReturnThis(),
        })),
      };
      this.tweens = { add: jest.fn((opts) => { opts.onComplete?.(); }) };
      this.input = { keyboard: { on: jest.fn() } };
      this.scale = { width: 672, height: 672 };
      this.grid = [];
      this.tileSize = 32;
      this.range = 4;
      this.coneAngle = 60;
      this.playerX = 0;
      this.playerY = 0;
      this.direction = 'down';
      this.otherPlayers = new Map();
      this.light = null;
      this.visualCones = null;
      this.player = null;
      this.roundState = 'waiting';
      this.isMoving = false;
      this.room = null;
      this.moveSpeed = 200;
      this.sessionId = '';
      this.pendingExpectedX = 0;
      this.pendingExpectedY = 0;
      this.pendingOldX = 0;
      this.pendingOldY = 0;
      this.isPendingSync = false;
      this.otherPlayerSprites = new Map();
      this.computeVisibleTilesFor = jest.fn(() => [{x:0,y:0}]);
    }
  
    handleKeyDown(event: KeyboardEvent) {
      if (this.roundState !== 'playing' || this.isMoving || !this.player) {
        return;
      }
  
      let newX = this.playerX;
      let newY = this.playerY;
      let newDirection = this.direction;
  
      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newX -= 1;
          newDirection = 'left';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newX += 1;
          newDirection = 'right';
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          newY -= 1;
          newDirection = 'up';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newY += 1;
          newDirection = 'down';
          break;
        default:
          return;
      }
  
      const oldX = this.playerX;
      const oldY = this.playerY;
  
      const inBounds = newX >= 0 && newX < this.grid[0].length && newY >= 0 && newY < this.grid.length;
      const isPath = inBounds ? this.grid[newY][newX] === 1 : false;
  
      if (inBounds && isPath) {
        // Track for potential server rejection (mirror real code)
        this.pendingExpectedX = newX;
        this.pendingExpectedY = newY;
        this.pendingOldX = oldX;
        this.pendingOldY = oldY;
        this.isPendingSync = true;
    
        this.isMoving = true;
        const targetX = newX * this.tileSize + this.tileSize / 2;
        const targetY = newY * this.tileSize + this.tileSize / 2;
    
        this.tweens.add({
          targets: this.player,
          x: targetX,
          y: targetY,
          duration: this.moveSpeed,
          ease: 'Linear',
          onComplete: () => {
            this.playerX = newX;
            this.playerY = newY;
            this.direction = newDirection;
            this.updateVisibility();
            this.isMoving = false;
            if (this.room) {
              this.room.send('move', {
                dx: newX - oldX,
                dy: newY - oldY,
                direction: newDirection
              });
            }
          }
        });
      }
    }
  
    updatePlayer(id: string, x: number, y: number, direction: string) {
      if (id === this.sessionId) {
        this.playerX = x;
        this.playerY = y;
        this.direction = direction;
        if (this.player) {
          this.player.x = x * this.tileSize + this.tileSize / 2;
          this.player.y = y * this.tileSize + this.tileSize / 2;
        }
        this.updateVisibility();
      } else {
        // Update other player state and sprite with tween for smooth movement
        this.otherPlayers.set(id, { x, y, direction });
  
        let sprite = this.otherPlayerSprites.get(id);
        const targetX = x * this.tileSize + this.tileSize / 2;
        const targetY = y * this.tileSize + this.tileSize / 2;
  
        if (!sprite) {
          // New player join: create sprite
          sprite = this.add.rectangle(
            targetX,
            targetY,
            28,
            28,
            0x00ff00 // Green for other players
          );
          sprite.setOrigin(0.5);
          this.otherPlayerSprites.set(id, sprite);
        } else {
          // Existing player: tween to new position
          this.tweens.add({
            targets: sprite,
            x: targetX,
            y: targetY,
            duration: this.moveSpeed,
            ease: 'Linear'
          });
        }
  
        this.updateVisibility();
      }
    }
  
    updateGameState(data: any) {
      if (!data) return;
  
      const newGrid = data.grid || [];
      if (Array.isArray(newGrid) && newGrid.length === 441) {
        const width = 21;
        this.grid = Array.from({ length: width }, (_, y) =>
          Array.from({ length: width }, (_, x) => newGrid[y * width + x])
        );
      } else {
        this.grid = newGrid.length ? newGrid : this.grid;
      }
  
      this.roundState = data.roundState ?? this.roundState;
    
      // Handle server rejection in mock (mirror real)
      if (this.isPendingSync) {
        const serverX = data.players?.get(this.sessionId)?.x || this.playerX;
        const serverY = data.players?.get(this.sessionId)?.y || this.playerY;
        if (serverX !== this.pendingExpectedX || serverY !== this.pendingExpectedY) {
          // Revert
          this.playerX = this.pendingOldX;
          this.playerY = this.pendingOldY;
          if (this.player) {
            const oldPosX = this.pendingOldX * this.tileSize + this.tileSize / 2;
            const oldPosY = this.pendingOldY * this.tileSize + this.tileSize / 2;
            this.tweens.add({
              targets: this.player,
              x: oldPosX,
              y: oldPosY,
              duration: this.moveSpeed / 2,
              ease: 'Linear',
              onComplete: () => {
                this.shakeEffect();
              }
            });
          }
          this.isPendingSync = false;
        } else {
          this.isPendingSync = false;
        }
      }
    
      if (data.players) {
        data.players.forEach((player: any, id: string) => {
          if (id !== this.sessionId) {
            this.updatePlayer(id, player.x, player.y, player.direction || 'down');
          } else {
            this.playerX = player.x || this.playerX;
            this.playerY = player.y || this.playerY;
            this.direction = player.direction || this.direction;
            if (this.player) {
              this.player.x = this.playerX * this.tileSize + this.tileSize / 2;
              this.player.y = this.playerY * this.tileSize + this.tileSize / 2;
            }
          }
        });
  
        // Remove players that left the room
        const currentPlayerIds = new Set(Array.from(data.players.keys()));
        this.otherPlayerSprites.forEach((sprite, id) => {
          if (id !== this.sessionId && !currentPlayerIds.has(id)) {
            sprite.destroy(true);
            this.otherPlayerSprites.delete(id);
            this.otherPlayers.delete(id);
          }
        });
      }
  
      if (this.grid.length > 0) {
        this.updateVisibility();
      }
    }

    updateVisibility() {
      const ownVisible = this.computeVisibleTilesFor(this.playerX, this.playerY, this.direction);
      const otherVisibles = new Map();
      this.otherPlayers.forEach((other, id) => {
        const vis = this.computeVisibleTilesFor(other.x, other.y, other.direction);
        otherVisibles.set(id, vis);
      });
      // Union for light
      const unionSet = new Set<string>();
      (ownVisible as {x: number, y: number}[]).forEach((tile) => {
        unionSet.add(`${tile.x},${tile.y}`);
      });
      (Array.from(otherVisibles.values()) as {x: number, y: number}[][]).forEach((vis) => {
        vis.forEach((tile) => {
          unionSet.add(`${tile.x},${tile.y}`);
        });
      });
      this.light.clear();
      if (unionSet.size > 0) {
        this.light.fillStyle(0xffffff, 1.0);
        unionSet.forEach((key) => {
          const [x, y] = (key as string).split(',').map(Number);
          this.light.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
        });
      }
      // Visual cones
      this.visualCones.clear();
      // Own
      if (ownVisible.length > 0) {
        this.visualCones.fillStyle(0xffffff, 0.3);
        (ownVisible as {x: number, y: number}[]).forEach((tile) => {
          this.visualCones.fillRect(tile.x * this.tileSize, tile.y * this.tileSize, this.tileSize, this.tileSize);
        });
      }
      // Others
      otherVisibles.forEach((vis) => {
        if (vis.length > 0) {
          this.visualCones.fillStyle(0xaaaaaa, 0.3);
          (vis as {x: number, y: number}[]).forEach((tile) => {
            this.visualCones.fillRect(tile.x * this.tileSize, tile.y * this.tileSize, this.tileSize, this.tileSize);
          });
        }
      });
    }

    shakeEffect() {
      // Mock implementation for test
    }
  
    init() {}
    preload() {}
    create() {}
    update() {}
  },
}));

describe('PhaserGame', () => {
  it('renders PhaserGame component', () => {
    const mockRoom = { state: { roundState: 'waiting' } };
    render(<PhaserGame room={mockRoom} sessionId="test-session" />);
    expect(screen.getByTestId('phaser-game')).toBeInTheDocument();
  });

  describe('MazeScene', () => {
    let mockScene: any;

    beforeEach(() => {
      mockScene = new (jest.requireMock('phaser').Scene)();
      mockScene.grid = [[1, 1], [1, 1]]; // 2x2 open grid
      mockScene.tileSize = 32;
      mockScene.range = 1;
      mockScene.coneAngle = 60;
      mockScene.playerX = 0;
      mockScene.playerY = 0;
      mockScene.direction = 'right';
      mockScene.otherPlayers = new Map();
      mockScene.light = { clear: jest.fn(), fillStyle: jest.fn().mockReturnThis(), fillRect: jest.fn().mockReturnThis() };
      mockScene.visualCones = { clear: jest.fn(), fillStyle: jest.fn().mockReturnThis(), fillRect: jest.fn().mockReturnThis() };
      mockScene.computeVisibleTilesFor = jest.fn(() => [{x:0,y:0}]);
      mockScene.sessionId = 'test-session';
      jest.spyOn(mockScene, 'updateVisibility');
    });

    it('computes visible tiles for own cone with direction', () => {
      const mockCompute = mockScene.computeVisibleTilesFor as jest.Mock;
      mockCompute.mockReturnValue([{ x: 0, y: 0 }, { x: 1, y: 0 }]);

      const result = mockScene.computeVisibleTilesFor(0, 0, 'right');
      expect(result).toHaveLength(2);
      expect(mockCompute).toHaveBeenCalledWith(0, 0, 'right');
    });

    it('updates player position and direction for self and triggers visibility update', () => {
      mockScene.updatePlayer('test-session', 1, 0, 'down');

      expect(mockScene.playerX).toBe(1);
      expect(mockScene.playerY).toBe(0);
      expect(mockScene.direction).toBe('down');
      expect(mockScene.updateVisibility).toHaveBeenCalled();
    });

    it('updates other player position and direction, adds to map, triggers visibility update', () => {
      mockScene.updatePlayer('other-id', 1, 1, 'left');

      expect(mockScene.otherPlayers.get('other-id')).toEqual({ x: 1, y: 1, direction: 'left' });
      expect(mockScene.updateVisibility).toHaveBeenCalled();
    });

    it('computes union of visible tiles across own and other cones', () => {
      const mockOwnVis = [{ x: 0, y: 0 }];
      const mockOtherVis = [{ x: 1, y: 0 }, { x: 0, y: 0 }];
      mockScene.computeVisibleTilesFor
        .mockReturnValueOnce(mockOwnVis)
        .mockReturnValueOnce(mockOtherVis);

      mockScene.otherPlayers.set('other1', { x: 1, y: 0, direction: 'down' });

      mockScene.updateVisibility();

      expect(mockScene.computeVisibleTilesFor).toHaveBeenCalledTimes(2);
      expect(mockScene.light.clear).toHaveBeenCalled();
      expect(mockScene.light.fillRect).toHaveBeenCalledTimes(2); // union: (0,0) and (1,0)
    });

    it('renders visual diff: own cone full, others semi-transparent', () => {
      const mockOwnVis = [{ x: 0, y: 0 }];
      const mockOtherVis = [{ x: 1, y: 0 }];
      mockScene.computeVisibleTilesFor
        .mockReturnValueOnce(mockOwnVis)
        .mockReturnValueOnce(mockOtherVis);

      mockScene.otherPlayers.set('other1', { x: 1, y: 0, direction: 'down' });

      mockScene.updateVisibility();

      expect(mockScene.visualCones.clear).toHaveBeenCalled();
      expect(mockScene.visualCones.fillStyle).toHaveBeenCalledWith(0xffffff, 0.3); // own
      expect(mockScene.visualCones.fillRect).toHaveBeenCalledWith(0 * 32, 0 * 32, 32, 32);
      expect(mockScene.visualCones.fillStyle).toHaveBeenCalledWith(0xaaaaaa, 0.3); // other
      expect(mockScene.visualCones.fillRect).toHaveBeenCalledWith(1 * 32, 0 * 32, 32, 32);
    });
  });

  describe('Player Movement', () => {
    let mockScene: any;
    let mockPlayer: any;
    let mockRoom: any;

    beforeEach(() => {
      mockScene = new (jest.requireMock('phaser').Scene)();
      mockScene.sessionId = 'test-session';
      mockScene.grid = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
      ];
      mockScene.tileSize = 32;
      mockScene.moveSpeed = 200;
      mockScene.roundState = 'playing';
      mockScene.isMoving = false;
      mockScene.playerX = 1;
      mockScene.playerY = 1;
      mockPlayer = {
        x: 48,
        y: 48,
      };
      mockScene.add.rectangle = jest.fn(() => mockPlayer);
      mockScene.player = mockPlayer;
      mockRoom = { send: jest.fn() };
      mockScene.room = mockRoom;
      mockScene.updateVisibility = jest.fn();
      mockScene.shakeEffect = jest.fn();
      mockScene.otherPlayerSprites = new Map();
      mockScene.add = {
        ...mockScene.add,
        rectangle: jest.fn(() => ({
          setOrigin: jest.fn().mockReturnThis(),
        })),
      };
    });

    it('ignores movement when roundState is not playing', () => {
      mockScene.roundState = 'waiting';
      const event = { key: 'ArrowRight' } as KeyboardEvent;
      mockScene.handleKeyDown(event);
      expect(mockScene.tweens.add).not.toHaveBeenCalled();
      expect(mockRoom.send).not.toHaveBeenCalled();
    });

    it('ignores movement when isMoving is true', () => {
      mockScene.isMoving = true;
      const event = { key: 'ArrowRight' } as KeyboardEvent;
      mockScene.handleKeyDown(event);
      expect(mockScene.tweens.add).not.toHaveBeenCalled();
      expect(mockRoom.send).not.toHaveBeenCalled();
    });

    it('handles valid right movement with ArrowRight key', () => {
      const event = { key: 'ArrowRight' } as KeyboardEvent;
      mockScene.handleKeyDown(event);
      expect(mockScene.tweens.add).toHaveBeenCalledWith(expect.objectContaining({
        targets: mockPlayer,
        x: 80,
        y: 48,
        duration: 200,
        ease: 'Linear',
      }));
      expect(mockScene.playerX).toBe(2);
      expect(mockScene.direction).toBe('right');
      expect(mockScene.updateVisibility).toHaveBeenCalled();
      expect(mockRoom.send).toHaveBeenCalledWith('move', {
        dx: 1,
        dy: 0,
        direction: 'right'
      });
      expect(mockScene.isMoving).toBe(false);
    });

    it('handles valid down movement with "s" key', () => {
      const event = { key: 's' } as KeyboardEvent;
      mockScene.handleKeyDown(event);
      expect(mockScene.tweens.add).toHaveBeenCalledWith(expect.objectContaining({
        targets: mockPlayer,
        x: 48,
        y: 80,
        duration: 200,
        ease: 'Linear',
      }));
      expect(mockScene.playerY).toBe(2);
      expect(mockScene.direction).toBe('down');
      expect(mockRoom.send).toHaveBeenCalledWith('move', {
        dx: 0,
        dy: 1,
        direction: 'down'
      });
    });

    it('prevents movement into walls', () => {
      mockScene.grid[1][0] = 0; // Wall left
      const event = { key: 'ArrowLeft' } as KeyboardEvent;
      mockScene.handleKeyDown(event);
      expect(mockScene.tweens.add).not.toHaveBeenCalled();
      expect(mockRoom.send).not.toHaveBeenCalled();
      expect(mockScene.playerX).toBe(1);
      expect(mockScene.isMoving).toBe(false);
    });

    it('prevents movement out of bounds', () => {
      mockScene.playerX = 2; // Right edge
      mockPlayer.x = 80;
      const event = { key: 'ArrowRight' } as KeyboardEvent;
      mockScene.handleKeyDown(event);
      expect(mockScene.tweens.add).not.toHaveBeenCalled();
      expect(mockScene.playerX).toBe(2);
    });

    it('reverts position and shakes on server rejection', () => {
      // Setup for valid local move
      const event = { key: 'ArrowRight' } as KeyboardEvent;
      mockScene.handleKeyDown(event);
      expect(mockScene.pendingExpectedX).toBe(2);
      expect(mockScene.pendingOldX).toBe(1);
      expect(mockScene.isPendingSync).toBe(true);

      // Mock server state change: no update (rejection)
      const mockServerPlayers = new Map();
      mockServerPlayers.set('test-session', { x: 1, y: 1, direction: 'down' }); // Stays at old pos
      mockScene.updateGameState({
        players: mockServerPlayers,
        roundState: 'playing',
        grid: mockScene.grid.flat()
      });

      // Assert revert
      expect(mockScene.playerX).toBe(1); // Reverted to old
      expect(mockScene.playerY).toBe(1);
      expect(mockScene.isPendingSync).toBe(false);

      // Assert revert tween called (target old pos)
      expect(mockScene.tweens.add).toHaveBeenCalledWith(expect.objectContaining({
        targets: mockPlayer,
        x: 48, // old pos 1*32 +16
        y: 48,
        duration: 100 // moveSpeed/2
      }));

      // Assert shake triggered (onComplete of revert)
      expect(mockScene.shakeEffect).toHaveBeenCalled();
    });
  });

  describe('State Synchronization', () => {
    let mockScene: any;
    let mockPlayers: Map<string, any>;

    beforeEach(() => {
      mockScene = new (jest.requireMock('phaser').Scene)();
      mockScene.sessionId = 'test-session';
      mockScene.grid = [[1,1,1],[1,1,1],[1,1,1]];
      mockScene.tileSize = 32;
      mockScene.player = { x: 48, y: 48 };
      mockScene.updateVisibility = jest.fn();
      mockScene.updatePlayer = jest.fn();
      mockPlayers = new Map();
    });

    it('updates local player position from server state', () => {
      mockPlayers.set('test-session', { x: 2, y: 0, direction: 'right' });
      mockPlayers.set('other-session', { x: 0, y: 0, direction: 'left' });

      mockScene.updateGameState({
        players: mockPlayers,
        roundState: 'playing',
        grid: mockScene.grid.flat()
      });

      expect(mockScene.playerX).toBe(2);
      expect(mockScene.playerY).toBe(0);
      expect(mockScene.direction).toBe('right');
      expect(mockScene.player.x).toBe(80);
      expect(mockScene.player.y).toBe(16);
      expect(mockScene.updateVisibility).toHaveBeenCalled();
      expect(mockScene.updatePlayer).toHaveBeenCalledWith('other-session', 0, 0, 'left');
    });

    it('handles state change without players (no update)', () => {
      mockScene.updateGameState({ roundState: 'playing', grid: [] });
      expect(mockScene.updatePlayer).not.toHaveBeenCalled();
      expect(mockScene.playerX).toBe(0); // unchanged
    });
  });
});
describe('Other Player Smooth Updates and Leaves', () => {
  let mockScene: any;
  let mockSprite: any;

  beforeEach(() => {
    mockScene = new (jest.requireMock('phaser').Scene)();
    mockScene.sessionId = 'test-session';
    mockScene.grid = [[1,1,1],[1,1,1],[1,1,1]];
    mockScene.tileSize = 32;
    mockScene.moveSpeed = 200;
    mockScene.roundState = 'playing';
    mockScene.otherPlayers = new Map();
    mockScene.otherPlayerSprites = new Map();
    mockScene.add = {
      ...mockScene.add,
      rectangle: jest.fn(() => mockSprite),
    };
    mockSprite = { setOrigin: jest.fn().mockReturnThis(), destroy: jest.fn() };
    mockScene.updateVisibility = jest.fn();
    jest.spyOn(mockScene.tweens, 'add');
  });

  it('tweens existing other player sprite to new position without destroying', () => {
    // Setup existing other
    mockScene.otherPlayerSprites.set('other1', mockSprite);
    mockScene.otherPlayers.set('other1', { x: 0, y: 0, direction: 'down' });

    mockScene.updatePlayer('other1', 1, 1, 'right');

    expect(mockScene.tweens.add).toHaveBeenCalledWith(expect.objectContaining({
      targets: mockSprite,
      x: 48, // 1*32 +16
      y: 48,
      duration: 200,
      ease: 'Linear'
    }));
    expect(mockSprite.destroy).not.toHaveBeenCalled();
    expect(mockScene.otherPlayers.get('other1')).toEqual({ x: 1, y: 1, direction: 'right' });
    expect(mockScene.updateVisibility).toHaveBeenCalled();
  });

  it('creates new sprite for joining other player without tween', () => {
    mockScene.updatePlayer('other2', 2, 0, 'left');

    expect(mockScene.add.rectangle).toHaveBeenCalledWith(80, 16, 28, 28, 0x00ff00); // pos 2,0
    expect(mockSprite.setOrigin).toHaveBeenCalled();
    expect(mockScene.otherPlayerSprites.get('other2')).toBe(mockSprite);
    expect(mockScene.tweens.add).not.toHaveBeenCalled();
    expect(mockScene.otherPlayers.get('other2')).toEqual({ x: 2, y: 0, direction: 'left' });
    expect(mockScene.updateVisibility).toHaveBeenCalled();
  });

  it('destroys sprite and clears maps for left player in updateGameState', () => {
    // Setup existing other
    const mockExistingSprite = { destroy: jest.fn() };
    mockScene.otherPlayerSprites.set('left-player', mockExistingSprite);
    mockScene.otherPlayers.set('left-player', { x: 0, y: 0, direction: 'down' });

    const mockPlayers = new Map();
    mockPlayers.set('test-session', { x: 0, y: 0, direction: 'down' });
    // No 'left-player' in mockPlayers

    mockScene.updateGameState({
      players: mockPlayers,
      roundState: 'playing',
      grid: mockScene.grid.flat()
    });

    expect(mockExistingSprite.destroy).toHaveBeenCalledWith(true);
    expect(mockScene.otherPlayerSprites.has('left-player')).toBe(false);
    expect(mockScene.otherPlayers.has('left-player')).toBe(false);
  });

  it('handles multiple other players with separate tweens', () => {
    const mockSprite1 = { setOrigin: jest.fn().mockReturnThis() };
    const mockSprite2 = { setOrigin: jest.fn().mockReturnThis() };
    mockScene.add.rectangle
      .mockReturnValueOnce(mockSprite1)
      .mockReturnValueOnce(mockSprite2);

    // Create two others
    mockScene.updatePlayer('other1', 1, 1, 'right');
    mockScene.updatePlayer('other2', 0, 2, 'down');

    expect(mockScene.otherPlayerSprites.size).toBe(2);
    expect(mockScene.tweens.add).not.toHaveBeenCalled(); // Both new, no tween
    expect(mockScene.updateVisibility).toHaveBeenCalledTimes(2);
  });

  it('handles rapid updates to same other player with multiple tweens', () => {
    // Setup existing
    mockScene.otherPlayerSprites.set('other1', mockSprite);
    mockScene.otherPlayers.set('other1', { x: 0, y: 0, direction: 'down' });

    // First update
    mockScene.updatePlayer('other1', 1, 1, 'right');
    // Second rapid update
    mockScene.updatePlayer('other1', 2, 1, 'right');

    expect(mockScene.tweens.add).toHaveBeenCalledTimes(2);
    expect(mockScene.tweens.add.mock.calls[0][0]).toMatchObject({
      targets: mockSprite,
      x: 48,
      y: 48
    });
    expect(mockScene.tweens.add.mock.calls[1][0]).toMatchObject({
      targets: mockSprite,
      x: 80,
      y: 48
    });
    expect(mockSprite.destroy).not.toHaveBeenCalled();
    expect(mockScene.otherPlayers.get('other1')).toEqual({ x: 2, y: 1, direction: 'right' });
  });
});