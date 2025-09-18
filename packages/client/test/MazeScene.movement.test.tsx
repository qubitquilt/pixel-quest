import { MockScene } from '@/test/mocks/phaser';

describe('Player Movement with Ray-Tracing', () => {
  let mockScene: any;
  let mockPlayer: any;
  let mockRoom: any;

  beforeEach(() => {
    mockScene = new MockScene({});
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
    mockScene.add = {
      ...mockScene.add,
      rectangle: jest.fn(() => mockPlayer),
    };
    mockScene.player = mockPlayer;
    mockRoom = { send: jest.fn() };
    mockScene.room = mockRoom;
    mockScene.lastDirection = { set: jest.fn(), setFromAngle: jest.fn(), normalize: jest.fn(), length: jest.fn(() => 1), angle: jest.fn(() => 0) };
    jest.spyOn(mockScene, 'shakeEffect');
    mockScene.otherPlayerSprites = new Map();
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