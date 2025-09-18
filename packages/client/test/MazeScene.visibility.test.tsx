import { MockScene } from '@/test/mocks/phaser';

describe('MazeScene Ray-Traced Visibility', () => {
  let mockScene: any;

  beforeEach(() => {
    mockScene = new MockScene({});
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

    expect(mockScene.computeVisibilityPolygon).toHaveBeenCalledTimes(2);
    expect(mockScene.flashlightGraphics.fillPoints).toHaveBeenCalledTimes(2);
    expect(mockScene.flashlightGraphics.fillStyle).toHaveBeenCalledWith(0xffffff, 1);
  });

  it('renders visual diff with own full white and others gray tint', () => {
    const mockOwnPolygon = [{ x: 16, y: 16 }, { x: 100, y: 100 }, { x: 200, y: 200 }];
    const mockOtherPolygon = [{ x: 48, y: 48 }, { x: 132, y: 132 }, { x: 216, y: 216 }];
    mockScene.computeVisibilityPolygon
      .mockReturnValueOnce(mockOwnPolygon)
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