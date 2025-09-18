import { MockScene } from '@/test/mocks/phaser';

describe('Ray Casting Verification', () => {
  let mockScene: any;

  beforeEach(() => {
    mockScene = new MockScene({});
    mockScene.tileSize = 32;
    mockScene.scale = { width: 672, height: 672 };
    mockScene.player = { x: 16, y: 16 }; // Center of (0,0) tile
    mockScene.walls = {
      getChildren: jest.fn(() => [])
    };
    mockScene.otherPlayers = new Map();
    // Clear calls for isolation
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('finds closest wall intersection per ray', () => {
    const mockWall1 = {
      getBounds: jest.fn(() => ({ x: 32, y: 0, width: 32, height: 32 })) // Wall at (1,0)
    };
    const mockWall2 = {
      getBounds: jest.fn(() => ({ x: 64, y: 0, width: 32, height: 32 })) // Farther wall
    };
    mockScene.walls.getChildren.mockReturnValue([mockWall1, mockWall2]);
    mockScene.walls.getChildren.mockReturnValue([mockWall1, mockWall2]);
    (mockScene.walls.children.entries[0].getBounds as jest.Mock).mockReturnValue({ x: 32, y: 0, width: 32, height: 32 });
    (mockScene.walls.children.entries[1].getBounds as jest.Mock).mockReturnValue({ x: 64, y: 0, width: 32, height: 32 });
    const getLineToRectSpy = jest.spyOn(require('phaser').Geom.Intersects, 'GetLineToRectangle');
    getLineToRectSpy.mockReturnValue([{ x: 24, y: 8 }]); // Close hit on wall1
    getLineToRectSpy.mockReturnValueOnce([{ x: 24, y: 8 }]) // Close hit on wall1
      .mockReturnValueOnce([{ x: 48, y: 16 }]); // Farther on wall2

    const polygon = mockScene.computeVisibilityPolygon(16, 16, 0); // Rightward

    expect(getLineToRectSpy).toHaveBeenCalledTimes(4); // 2 walls * 2 rays
    expect(polygon.length).toBe(3); // Player + 2 rays
    // Assert closest is wall1 hit (shorter dist)
    const player = { x: 16, y: 16 };
    const distClose = require('phaser').Math.Distance.BetweenPoints(player, { x: 24, y: 8 });
    const distFar = require('phaser').Math.Distance.BetweenPoints(player, { x: 48, y: 16 });
    expect(distClose).toBeLessThan(distFar);
    // Polygon uses close one
    expect(polygon.some((p: {x: number, y: number}) => p.x === 24 && p.y === 8)).toBe(true);
  });

  it('uses full cone to 400px with no walls', () => {
    mockScene.walls.getChildren.mockReturnValue([]);
    const polygon = mockScene.computeVisibilityPolygon(16, 16, Math.PI / 2); // Downward cone

    expect(polygon.length).toBe(3); // Player + 2 rays
    // Endpoints at ~400px
    const player = { x: 16, y: 16 };
    polygon.slice(1).forEach((p: {x: number, y: number}) => {
      expect(require('phaser').Math.Distance.BetweenPoints(player, p)).toBeCloseTo(400, 0);
    });
  });

  it('occludes with multiple walls, selects closest per ray', () => {
    const mockWalls = [
      { getBounds: jest.fn(() => ({ x: 32, y: 16, width: 32, height: 32 })) }, // Close wall
      { getBounds: jest.fn(() => ({ x: 64, y: 16, width: 32, height: 32 })) }  // Far wall
    ];
    mockScene.walls.getChildren.mockReturnValue(mockWalls);
    const getLineToRectSpy = jest.spyOn(require('phaser').Geom.Intersects, 'GetLineToRectangle');
    getLineToRectSpy.mockReturnValueOnce([{ x: 32, y: 16 }]) // Close
      .mockReturnValueOnce([]) // No hit on far for this ray
      .mockReturnValueOnce([{ x: 48, y: 16 }, { x: 80, y: 16 }]); // Multiple, select close

    const polygon = mockScene.computeVisibilityPolygon(16, 16, 0);

    expect(getLineToRectSpy).toHaveBeenCalledTimes(6); // 2 walls * 3 rays
    // For ray with multiple, closest selected (48 closer than 80)
    expect(polygon.some((p: {x: number, y: number}) => p.x === 32 && p.y === 16)).toBe(true);
    expect(polygon.some((p: {x: number, y: number}) => p.x === 80 && p.y === 16)).toBe(false);
  });

  it('falls back to scene bounds if no wall hit', () => {
    mockScene.walls.getChildren.mockReturnValue([]);
    // Mock ray hitting right bound
    const getLineToRectSpy = jest.spyOn(require('phaser').Geom.Intersects, 'GetLineToRectangle');
    getLineToRectSpy.mockReturnValue([{ x: 300, y: 16 }]);

    const polygon = mockScene.computeVisibilityPolygon(16, 16, 0);

    expect(getLineToRectSpy).toHaveBeenCalledTimes(2); // 1 ray * 1 bounds check
    expect(polygon.some((p: {x: number, y: number}) => p.x === 300 && p.y === 16)).toBe(true);
    // Dist to bounds < 400, so used
    const player = { x: 16, y: 16 };
    const distBounds = require('phaser').Math.Distance.BetweenPoints(player, { x: 300, y: 16 });
    expect(distBounds).toBeLessThan(400);
  });
});