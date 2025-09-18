import { MockScene } from '@/test/mocks/phaser';

describe('State Synchronization with Ray-Tracing', () => {
  let mockScene: any;
  let mockPlayers: Map<string, any>;

  beforeEach(() => {
    mockScene = new MockScene({});
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