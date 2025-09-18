import { MockScene } from '@/test/mocks/phaser';

describe('Other Player Smooth Updates and Leaves', () => {
  let mockScene: any;
  let mockSprite: any;

  beforeEach(() => {
    mockScene = new MockScene({});
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