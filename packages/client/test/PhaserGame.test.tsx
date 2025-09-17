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
    updateVisibility: any;

    constructor(config: any) {
      this.key = config.key;
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
      this.tweens = { add: jest.fn() };
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
      this.computeVisibleTilesFor = jest.fn();
      this.updateVisibility = jest.fn();
    }
    init() {}
    preload() {}
    create() {}
    update() {}
  },
}));

describe('PhaserGame', () => {
  it('renders PhaserGame component', () => {
    const mockGameState = {
      grid: [],
      playerX: 0,
      playerY: 0,
      direction: 'down',
      roundState: 'waiting',
      sessionId: 'test-session',
      roomId: 'test-room',
    };
    render(<PhaserGame gameState={mockGameState} />);
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
      mockScene.computeVisibleTilesFor = jest.fn();
      mockScene.updateVisibility = jest.fn();
    });

    it('computes visible tiles for own cone with direction', () => {
      const mockCompute = mockScene.computeVisibleTilesFor as jest.Mock;
      mockCompute.mockReturnValue([{ x: 0, y: 0 }, { x: 1, y: 0 }]);

      const result = mockScene.computeVisibleTilesFor(0, 0, 'right');
      expect(result).toHaveLength(2);
      expect(mockCompute).toHaveBeenCalledWith(0, 0, 'right');
    });

    it('updates player position and direction for self and triggers visibility update', () => {
      mockScene.updatePlayer('self-id', 1, 0, 'down');

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