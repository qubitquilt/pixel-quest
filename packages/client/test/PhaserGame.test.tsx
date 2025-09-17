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
  Math: {
    Angle: {
      RotateTo: function(current: number, target: number, step: number): number {
        let diff = target - current;
        // Normalize to shortest angle (-PI to PI)
        while (diff > Math.PI) diff -= 2 * Math.PI;
        while (diff < -Math.PI) diff += 2 * Math.PI;
        // Step towards target
        const maxStep = Math.min(step, Math.abs(diff));
        return current + Math.sign(diff) * maxStep;
      }
    }
  },
  Scene: class MockScene {
    key: string;
    data: any;
    add: any;
    make: any;
    physics: any;
    tweens: any;
    input: any;
    scale: any;
    grid: any;
    tileSize: number;
    playerX: number;
    playerY: number;
    direction: string;
    otherPlayers: Map<string, any>;
    light: any;
    visualCones: any;
    walls: any;
    cover: any;
    flashlightGraphics: any;
    lastDirection: any;
    targetAngle: number;
    currentAngle: number;
    rotationSpeed: number;
    dirToAngle: any;
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
          fillPoints: jest.fn().mockReturnThis(),
          clear: jest.fn().mockReturnThis(),
          setDepth: jest.fn().mockReturnThis(),
          setMask: jest.fn().mockReturnThis(),
          generateTexture: jest.fn().mockReturnThis(),
          destroy: jest.fn().mockReturnThis(),
        })),
        rectangle: jest.fn(() => ({
          setOrigin: jest.fn().mockReturnThis(),
          setDepth: jest.fn().mockReturnThis(),
        })),
        tileSprite: jest.fn(() => ({
          setOrigin: jest.fn().mockReturnThis(),
          setDepth: jest.fn().mockReturnThis(),
          setTint: jest.fn().mockReturnThis(),
        })),
      };
      this.make = {
        graphics: jest.fn(() => ({
          fillStyle: jest.fn().mockReturnThis(),
          fillRect: jest.fn().mockReturnThis(),
          generateTexture: jest.fn().mockReturnThis(),
          destroy: jest.fn().mockReturnThis(),
        })),
      };
      this.physics = {
        add: {
          staticGroup: jest.fn(() => ({
            create: jest.fn(() => ({
              body: {
                setSize: jest.fn(),
                immovable: true,
              },
              getBounds: jest.fn(() => ({})),
            })),
            getChildren: jest.fn(() => []),
            clear: jest.fn(),
          })),
        },
      };
      this.tweens = { add: jest.fn((opts) => { opts.onComplete?.(); }) };
      this.input = { keyboard: { on: jest.fn() } };
      this.scale = { width: 672, height: 672 };
      this.grid = [];
      this.tileSize = 32;
      this.playerX = 0;
      this.playerY = 0;
      this.direction = 'down';
      this.otherPlayers = new Map();
      this.light = null;
      this.visualCones = null;
      this.walls = null;
      this.cover = null;
      this.flashlightGraphics = null;
      this.lastDirection = { set: jest.fn(), setFromAngle: jest.fn(), normalize: jest.fn(), length: jest.fn(() => 1), angle: jest.fn(() => 0) };
      this.targetAngle = Math.PI / 2;
      this.currentAngle = Math.PI / 2;
      this.rotationSpeed = 8;
      this.dirToAngle = {
        right: 0,
        down: Math.PI / 2,
        left: Math.PI,
        up: -Math.PI / 2,
      };
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
    }

    computeVisibilityPolygon(posX: number, posY: number, angle: number) {
      const mockPoints = [new (jest.fn())(posX, posY)];
      return mockPoints;
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
            const dx = newX - oldX;
            const dy = newY - oldY;
            this.lastDirection.set(dx, dy);
            if (this.lastDirection.length() > 0) {
              this.lastDirection.normalize();
            }
            this.targetAngle = this.lastDirection.angle();
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
      } else {
        this.shakeEffect();
      }
    }

    updatePlayer(id: string, x: number, y: number, direction: string) {
      if (id === this.sessionId) {
        this.playerX = x;
        this.playerY = y;
        this.direction = direction;
        this.lastDirection.setFromAngle(this.dirToAngle[direction as keyof typeof this.dirToAngle]);
        this.targetAngle = this.dirToAngle[direction as keyof typeof this.dirToAngle];
        this.currentAngle = this.targetAngle;
        if (this.player) {
          this.player.x = x * this.tileSize + this.tileSize / 2;
          this.player.y = y * this.tileSize + this.tileSize / 2;
          this.player.setDepth(5);
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
          sprite.setDepth(5);
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
              this.player.setDepth(5);
              this.lastDirection.setFromAngle(this.dirToAngle[this.direction as keyof typeof this.dirToAngle]);
              this.targetAngle = this.dirToAngle[this.direction as keyof typeof this.dirToAngle];
              this.currentAngle = this.targetAngle;
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
      if (!this.flashlightGraphics || !this.visualCones || this.grid.length === 0 || !this.player || !this.walls) return;
      const ownPosX = this.player.x;
      const ownPosY = this.player.y;
      const ownPolygon = this.computeVisibilityPolygon(ownPosX, ownPosY, this.currentAngle);

      this.flashlightGraphics.clear();
      this.flashlightGraphics.fillStyle(0xffffff, 1);
      if (ownPolygon.length > 2) {
        this.flashlightGraphics.fillPoints(ownPolygon, true);
      }

      // Other players' polygons for union reveal
      this.otherPlayers.forEach((other) => {
        const otherPosX = other.x * this.tileSize + this.tileSize / 2;
        const otherPosY = other.y * this.tileSize + this.tileSize / 2;
        const otherAngle = this.dirToAngle[other.direction as keyof typeof this.dirToAngle];
        const otherPolygon = this.computeVisibilityPolygon(otherPosX, otherPosY, otherAngle);
        if (otherPolygon.length > 2) {
          this.flashlightGraphics.fillPoints(otherPolygon, true);
        }
      });

      // Visual cones overlay
      this.visualCones.clear();

      // Own cone
      this.visualCones.fillStyle(0xffffff, 0.3);
      if (ownPolygon.length > 2) {
        this.visualCones.fillPoints(ownPolygon, true);
      }

      // Other players' cones tinted
      this.otherPlayers.forEach((other) => {
        const otherPosX = other.x * this.tileSize + this.tileSize / 2;
        const otherPosY = other.y * this.tileSize + this.tileSize / 2;
        const otherAngle = this.dirToAngle[other.direction as keyof typeof this.dirToAngle];
        const otherPolygon = this.computeVisibilityPolygon(otherPosX, otherPosY, otherAngle);
        this.visualCones.fillStyle(0x888888, 0.3);
        if (otherPolygon.length > 2) {
          this.visualCones.fillPoints(otherPolygon, true);
        }
      });
    }

    shakeEffect() {
      // Mock implementation for test
    }

    update(time: number, delta: number) {
      let diff = this.targetAngle - this.currentAngle;
      // Normalize to shortest angle (-PI to PI)
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      // Step towards target
      const step = this.rotationSpeed * (delta / 1000);
      const maxStep = Math.min(step, Math.abs(diff));
      this.currentAngle = this.currentAngle + Math.sign(diff) * maxStep;
      this.updateVisibility();
    }
  
    init() {}
    preload() {}
    create() {}
  },
}));

describe('PhaserGame', () => {
  it('renders PhaserGame component', () => {
    const mockRoom = { state: { roundState: 'waiting' } };
    render(<PhaserGame room={mockRoom} sessionId="test-session" />);
    expect(screen.getByTestId('phaser-game')).toBeInTheDocument();
  });

  describe('MazeScene Ray-Traced Visibility', () => {
    let mockScene: any;

    beforeEach(() => {
      mockScene = new (jest.requireMock('phaser').Scene)();
      mockScene.grid = [[1, 1], [1, 1]]; // 2x2 open grid
      mockScene.tileSize = 32;
      mockScene.playerX = 0;
      mockScene.playerY = 0;
      mockScene.player = { x: 16, y: 16, setDepth: jest.fn().mockReturnThis() };
      mockScene.otherPlayers = new Map();
      mockScene.sessionId = 'test-session';
      mockScene.walls = { getChildren: jest.fn(() => []) };
      mockScene.flashlightGraphics = { clear: jest.fn(), fillStyle: jest.fn().mockReturnThis(), fillPoints: jest.fn().mockReturnThis() };
      mockScene.visualCones = { clear: jest.fn(), fillStyle: jest.fn().mockReturnThis(), fillPoints: jest.fn().mockReturnThis() };
      mockScene.computeVisibilityPolygon = jest.fn(() => [{ x: 16, y: 16 }, { x: 100, y: 100 }, { x: 200, y: 200 }]);
      mockScene.lastDirection = { set: jest.fn(), setFromAngle: jest.fn(), normalize: jest.fn(), length: jest.fn(() => 1), angle: jest.fn(() => 0) };
      mockScene.dirToAngle = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
      jest.spyOn(mockScene, 'updateVisibility');
    });

    it('computes visibility polygon for own cone with current angle', () => {
      const mockPolygon = [{ x: 16, y: 16 }, { x: 100, y: 100 }, { x: 200, y: 200 }];
      mockScene.computeVisibilityPolygon = jest.fn().mockReturnValue(mockPolygon);
      mockScene.currentAngle = 0;

      mockScene.updateVisibility();

      expect(mockScene.computeVisibilityPolygon).toHaveBeenCalledWith(16, 16, 0);
      expect(mockScene.flashlightGraphics.fillPoints).toHaveBeenCalledWith(mockPolygon, true);
      expect(mockScene.updateVisibility).toHaveBeenCalled();
    });

    it('unions multiple polygons from other players in light graphics', () => {
      const mockOwnPolygon = [{ x: 16, y: 16 }, { x: 100, y: 100 }, { x: 200, y: 200 }];
      const mockOtherPolygon = [{ x: 48, y: 48 }, { x: 132, y: 132 }, { x: 216, y: 216 }];
      mockScene.computeVisibilityPolygon
        .mockReturnValueOnce(mockOwnPolygon)
        .mockReturnValueOnce(mockOtherPolygon);
      mockScene.otherPlayers.set('other1', { x: 1, y: 1, direction: 'down' });

      mockScene.updateVisibility();

      expect(mockScene.computeVisibilityPolygon).toHaveBeenCalledTimes(3);
      expect(mockScene.flashlightGraphics.fillPoints).toHaveBeenCalledTimes(2);
      expect(mockScene.flashlightGraphics.fillStyle).toHaveBeenCalledWith(0xffffff, 1);
    });

    it('renders visual diff with own full white and others gray tint', () => {
      const mockOwnPolygon = [{ x: 16, y: 16 }, { x: 100, y: 100 }, { x: 200, y: 200 }];
      const mockOtherPolygon = [{ x: 48, y: 48 }, { x: 132, y: 132 }, { x: 216, y: 216 }];
      mockScene.computeVisibilityPolygon
        .mockReturnValueOnce(mockOwnPolygon)
        .mockReturnValueOnce(mockOtherPolygon)
        .mockReturnValueOnce(mockOtherPolygon);
      mockScene.otherPlayers.set('other1', { x: 1, y: 1, direction: 'down' });

      mockScene.updateVisibility();

      expect(mockScene.visualCones.fillStyle).toHaveBeenCalledWith(0xffffff, 0.3); // own
      expect(mockScene.visualCones.fillPoints).toHaveBeenCalledWith(mockOwnPolygon, true);
      expect(mockScene.visualCones.fillStyle).toHaveBeenNthCalledWith(2, 0x888888, 0.3); // other
      expect(mockScene.visualCones.fillPoints).toHaveBeenCalledWith(mockOtherPolygon, true);
    });

    it('updates direction and angle for self player', () => {
      mockScene.updatePlayer('test-session', 1, 0, 'right');

      expect(mockScene.playerX).toBe(1);
      expect(mockScene.playerY).toBe(0);
      expect(mockScene.direction).toBe('right');
      expect(mockScene.lastDirection.setFromAngle).toHaveBeenCalledWith(0);
      expect(mockScene.targetAngle).toBe(0);
      expect(mockScene.currentAngle).toBe(0);
      expect(mockScene.updateVisibility).toHaveBeenCalled();
    });

    it('handles other player updates without angle change for self', () => {
      mockScene.updatePlayer('other-id', 1, 1, 'left');

      expect(mockScene.otherPlayers.get('other-id')).toEqual({ x: 1, y: 1, direction: 'left' });
      expect(mockScene.lastDirection.setFromAngle).not.toHaveBeenCalled();
      expect(mockScene.updateVisibility).toHaveBeenCalled();
    });
  });

  describe('Player Movement with Ray-Tracing', () => {
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
        setDepth: jest.fn().mockReturnThis(),
      };
      mockScene.add.rectangle = jest.fn(() => mockPlayer);
      mockScene.player = mockPlayer;
      mockRoom = { send: jest.fn() };
      mockScene.room = mockRoom;
      mockScene.lastDirection = { set: jest.fn(), setFromAngle: jest.fn(), normalize: jest.fn(), length: jest.fn(() => 1), angle: jest.fn(() => 0) };
      jest.spyOn(mockScene, 'shakeEffect');
      mockScene.otherPlayerSprites = new Map();
      mockScene.add = {
        ...mockScene.add,
        rectangle: jest.fn(() => ({
          setOrigin: jest.fn().mockReturnThis(),
          setDepth: jest.fn().mockReturnThis(),
        })),
      };
    });

    it('updates lastDirection and targetAngle on valid move complete', () => {
      const event = { key: 'ArrowRight' } as KeyboardEvent;
      mockScene.handleKeyDown(event);

      expect(mockScene.lastDirection.set).toHaveBeenCalledWith(1, 0);
      expect(mockScene.lastDirection.normalize).toHaveBeenCalled();
      expect(mockScene.targetAngle).toBe(0); // right
      expect(mockScene.isMoving).toBe(false);
      expect(mockRoom.send).toHaveBeenCalledWith('move', {
        dx: 1,
        dy: 0,
        direction: 'right'
      });
    });

    it('prevents movement into walls and triggers shake', () => {
      mockScene.grid[1][0] = 0; // Wall left
      const event = { key: 'ArrowLeft' } as KeyboardEvent;
      mockScene.handleKeyDown(event);

      expect(mockScene.tweens.add).not.toHaveBeenCalled();
      expect(mockRoom.send).not.toHaveBeenCalled();
      expect(mockScene.playerX).toBe(1);
      expect(mockScene.isMoving).toBe(false);
      expect(mockScene.shakeEffect).toHaveBeenCalled();
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

  describe('State Synchronization with Ray-Tracing', () => {
    let mockScene: any;
    let mockPlayers: Map<string, any>;

    beforeEach(() => {
      mockScene = new (jest.requireMock('phaser').Scene)();
      mockScene.sessionId = 'test-session';
      mockScene.grid = [[1,1,1],[1,1,1],[1,1,1]];
      mockScene.tileSize = 32;
      mockScene.player = { x: 48, y: 48, setDepth: jest.fn().mockReturnThis() };
      mockScene.updateVisibility = jest.fn();
      mockScene.updatePlayer = jest.fn();
      mockPlayers = new Map();
      mockScene.lastDirection = { setFromAngle: jest.fn(), length: jest.fn(() => 1), angle: jest.fn(() => 0) };
      mockScene.dirToAngle = { right: 0, down: Math.PI / 2, left: Math.PI, up: -Math.PI / 2 };
    });

    it('updates local player position from server state and sets angle', () => {
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
      expect(mockScene.player.setDepth).toHaveBeenCalledWith(5);
      expect(mockScene.lastDirection.setFromAngle).toHaveBeenCalledWith(0);
      expect(mockScene.targetAngle).toBe(0);
      expect(mockScene.currentAngle).toBe(0);
      expect(mockScene.updateVisibility).toHaveBeenCalled();
      expect(mockScene.updatePlayer).toHaveBeenCalledWith('other-session', 0, 0, 'left');
    });

    it('handles state change without players (no update)', () => {
      mockScene.updateGameState({ roundState: 'playing', grid: [] });
      expect(mockScene.updatePlayer).not.toHaveBeenCalled();
      expect(mockScene.playerX).toBe(0); // unchanged
    });
  });

  describe('Angle Interpolation and Update Loop', () => {
    let mockScene: any;

    beforeEach(() => {
      mockScene = new (jest.requireMock('phaser').Scene)();
      mockScene.targetAngle = Math.PI;
      mockScene.currentAngle = 0;
      mockScene.rotationSpeed = 8;
      mockScene.updateVisibility = jest.fn();
    });

    it('interpolates currentAngle towards target in update', () => {
      mockScene.update(0, 500); // delta 500ms, step 4 rad/s

      expect(mockScene.currentAngle).toBeGreaterThan(0);
      expect(mockScene.currentAngle).toBe(Math.PI);
      expect(mockScene.currentAngle).toBeCloseTo(Math.PI, 10);
      expect(mockScene.updateVisibility).toHaveBeenCalled();
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
    mockSprite = { setOrigin: jest.fn().mockReturnThis(), destroy: jest.fn(), setDepth: jest.fn().mockReturnThis() };
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
    const mockSprite1 = { setOrigin: jest.fn().mockReturnThis(), setDepth: jest.fn().mockReturnThis() };
    const mockSprite2 = { setOrigin: jest.fn().mockReturnThis(), setDepth: jest.fn().mockReturnThis() };
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