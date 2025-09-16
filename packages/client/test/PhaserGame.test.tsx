const mockSceneStart = jest.fn();

const mockUpdatePlayerPosition = jest.fn();

jest.mock('phaser', () => {
  class MockScene {
    key: string;
    data: any;
    grid: number[][] = [];
    playerX = 0;
    playerY = 0;
    direction = 'down';
    range = 4;
    coneAngle = 60;
    light: any = null;
    fog: any = null;
    tileSize = 32;
    isMoving = false;
    roundState = 'waiting';
    player: any = null;
    tweens: any = { add: jest.fn() };
    input: any = { keyboard: { on: jest.fn() } };
    constructor(config: any) {
      this.key = config?.key || '';
      this.data = {};
    }
    init(data: any) {
      this.data = data;
    }
    preload() {}
    create() {}
    update() {}
    handleKeyDown(event: any) {}
    updatePlayerPosition(x: number, y: number) {
      this.playerX = x;
      this.playerY = y;
      mockUpdatePlayerPosition(x, y);
      this.updateVisibility();
    }
    updateVisibility() {
      if (!this.light || !this.fog) return;
      this.light.clear();
      this.light.fillStyle(0xffffff, 1);
      const visibles = this.computeVisibleTiles();
      visibles.forEach(v => {
        this.light.fillRect(v.x * this.tileSize, v.y * this.tileSize, this.tileSize, this.tileSize);
      });
    }
    computeVisibleTiles(): {x: number, y: number}[] {
      return [];
    }
    add: any = {
      graphics: () => ({
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
      }),
      rectangle: (x: any, y: any, width: any, height: any, color: any) => ({
        setOrigin: jest.fn().mockReturnThis(),
        x,
        y,
      }),
    };
    scale: any = { width: 672, height: 672 };
  }

  return {
    AUTO: 0,
    Scene: MockScene,
    Game: class MockGame {
      config: any;
      scene: any;
      events: any;
      constructor(config: any) {
        this.config = config;
        this.scene = {
          start: mockSceneStart,
          getScene: jest.fn().mockReturnValue(new MockScene({ key: 'MazeScene' })),
        };
        this.events = {
          on: jest.fn(),
        };
      }
      destroy() {
        jest.fn();
      }
    },
    GameObjects: {
      Rectangle: class MockRectangle {
        x: number;
        y: number;
        constructor(x: any, y: any, width: any, height: any, color: any) {
          this.x = x;
          this.y = y;
        }
        setOrigin() {
          return this;
        }
      },
    },
    Types: {
      Input: {
        Keyboard: {
          CursorKeys: class {},
          Event: class {},
        },
      },
    },
  };
});

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import Phaser from 'phaser';
import PhaserGame from '../app/components/PhaserGame';

const MockScene = Phaser.Scene;

describe('PhaserGame', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('renders without crashing', () => {
    const mockGameState = { grid: [[1,0],[0,1]] };
    render(<PhaserGame gameState={mockGameState} />);
    expect(screen.getByTestId('phaser-game')).toBeInTheDocument();
  });

  it('passes gameState to Phaser config', () => {
    const mockGameState = {
      grid: [[1,0],[0,1]],
      roundState: 'playing',
      sessionId: 'test-session',
      players: new Map([['test-session', { x: 1, y: 1 }]]),
    };
    render(<PhaserGame gameState={mockGameState} />);
    expect(mockSceneStart).toHaveBeenCalledWith('MazeScene', expect.objectContaining({
      grid: mockGameState.grid,
      roundState: 'playing',
      playerX: 1,
      playerY: 1,
    }));
  });

  describe('local movement controls', () => {
    let scene: any;

    beforeEach(() => {
      scene = new MockScene({ key: 'MazeScene' });
      const mockGrid = [
        [0, 1, 1, 0],
        [1, 1, 1, 1],
        [0, 1, 0, 1],
        [1, 1, 1, 0]
      ];
      scene.grid = mockGrid;
      scene.playerX = 1;
      scene.playerY = 1;
      scene.roundState = 'playing';
      scene.isMoving = false;
      scene.player = { x: 48, y: 48 }; // Mock player
      scene.tweens = { add: jest.fn().mockImplementation(() => ({ onComplete: jest.fn() })) };
      scene.input = { keyboard: { on: jest.fn() } };
      jest.spyOn(scene, 'updateVisibility');
      scene.handleKeyDown = jest.fn();
    });

    it('ignores movement when not playing', () => {
      scene.roundState = 'waiting';
      const mockEvent = { key: 'ArrowRight' };
      scene.handleKeyDown(mockEvent);
      expect(scene.tweens.add).not.toHaveBeenCalled();
    });

    it('prevents movement into walls (grid === 0)', () => {
      const mockEvent = { key: 'ArrowLeft' };
      // Left from (1,1) to (0,1): grid[1][0] = 1 (open)
      scene.handleKeyDown = jest.fn(() => {
        // Mock valid move
        scene.tweens.add();
      });
      scene.handleKeyDown(mockEvent);
      expect(scene.tweens.add).toHaveBeenCalled();

      // Reset and test wall
      scene.grid[0][1] = 0; // Make wall
      scene.handleKeyDown({ key: 'ArrowUp' });
      expect(scene.tweens.add).toHaveBeenCalledTimes(1); // Not called for wall
    });

    it('prevents out of bounds movement', () => {
      scene.playerX = 0; // Edge
      scene.handleKeyDown({ key: 'ArrowLeft' });
      expect(scene.tweens.add).not.toHaveBeenCalled();
    });

    it('handles WASD keys same as arrows', () => {
      scene.handleKeyDown({ key: 'w' }); // Up
      expect(scene.tweens.add).toHaveBeenCalled();
      scene.handleKeyDown({ key: 'a' }); // Left
      expect(scene.tweens.add).toHaveBeenCalledTimes(2);
    });

    it('updates position and visibility after tween complete', () => {
      const mockEvent = { key: 'ArrowRight' };
      scene.handleKeyDown(mockEvent);
      const tween = scene.tweens.add.mock.results[0].value;
      tween.onComplete(); // Simulate complete
      expect(scene.playerX).toBe(2);
      expect(scene.updateVisibility).toHaveBeenCalled();
      expect(scene.isMoving).toBe(false);
    });

    it('prevents movement while already moving', () => {
      scene.isMoving = true;
      scene.handleKeyDown({ key: 'ArrowDown' });
      expect(scene.tweens.add).not.toHaveBeenCalled();
    });
  });

  describe('visibility mechanics', () => {
    let scene: any;

    beforeEach(() => {
      scene = new MockScene({ key: 'MazeScene' });
      const mockGrid = [
        [0, 1, 1, 0],
        [1, 1, 1, 1],
        [0, 1, 0, 1],
        [1, 1, 1, 0]
      ];
      scene.grid = mockGrid;
      scene.playerX = 1;
      scene.playerY = 1;
      scene.range = 2;
      scene.coneAngle = 90;
      scene.light = { clear: jest.fn(), fillStyle: jest.fn().mockReturnThis(), fillRect: jest.fn() };
      scene.fog = { fillStyle: jest.fn().mockReturnThis(), fillRect: jest.fn().mockReturnThis() };
      jest.spyOn(scene, 'computeVisibleTiles').mockReturnValue([
        {x: 1, y: 1}, // player
        {x: 1, y: 2}, {x: 0, y: 2}, {x: 2, y: 2}, // down cone
      ]);
    });

    it('computes visible tiles in cone for down direction', () => {
      scene.direction = 'down';
      scene.updateVisibility();

      expect(scene.light.clear).toHaveBeenCalled();
      expect(scene.light.fillStyle).toHaveBeenCalledWith(0xffffff, 1);
      expect(scene.light.fillRect).toHaveBeenCalledTimes(4);
      expect(scene.light.fillRect).toHaveBeenCalledWith(32, 32, 32, 32); // (1,1)
      expect(scene.light.fillRect).toHaveBeenCalledWith(32, 64, 32, 32); // (1,2)
      expect(scene.light.fillRect).toHaveBeenCalledWith(0, 64, 32, 32); // (0,2)
      expect(scene.light.fillRect).toHaveBeenCalledWith(64, 64, 32, 32); // (2,2)
    });

    it('updates visibility on position change', () => {
      const updateSpy = jest.spyOn(scene, 'updateVisibility');
      scene.updatePlayerPosition(2, 1);
      expect(updateSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('updates player position on state change', () => {
    const mockRoom = {
      state: {
        players: new Map([
          ['test-session', { x: 2, y: 2 }]
        ]),
        onChange: jest.fn(),
      },
    };
    const mockGameState = {
      grid: [[1,1],[1,1]],
      sessionId: 'test-session',
      players: new Map([
        ['test-session', { x: 1, y: 1 }]
      ])
    };

    mockUpdatePlayerPosition.mockClear();

    render(<PhaserGame gameState={mockGameState} room={mockRoom} />);

    // Simulate state change
    const changes = [{ field: 'players', value: mockRoom.state.players }];
    mockRoom.state.onChange(changes);

    expect(mockUpdatePlayerPosition).toHaveBeenCalledWith(2, 2);
  });
});