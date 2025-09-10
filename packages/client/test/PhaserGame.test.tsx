const mockSceneStart = jest.fn();

const mockUpdatePlayerPosition = jest.fn();

jest.mock('phaser', () => {
  class MockScene {
    key: string;
    data: any;
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
    updatePlayerPosition = mockUpdatePlayerPosition;
    add: any = {
      graphics: () => ({
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
      }),
      rectangle: (x: any, y: any, width: any, height: any, color: any) => ({
        setOrigin: jest.fn().mockReturnThis(),
        x,
        y,
      }),
    };
    input: any = {
      keyboard: {
        createCursorKeys: () => ({
          left: { isDown: false },
          right: { isDown: false },
          up: { isDown: false },
          down: { isDown: false },
        }),
      },
    };
  }

  class MockGame {
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
  }

  class MockRectangle {
    x: number;
    y: number;
    constructor(x: any, y: any, width: any, height: any, color: any) {
      this.x = x;
      this.y = y;
    }
    setOrigin() {
      return this;
    }
  }

  return {
    AUTO: 0,
    Scene: MockScene,
    Game: MockGame,
    GameObjects: {
      Rectangle: MockRectangle,
    },
    Types: {
      Input: {
        Keyboard: {
          CursorKeys: class {},
        },
      },
    },
  };
});

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import PhaserGame from '../app/components/PhaserGame';

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

  it('handles keydown events', () => {
    const mockGameState = { grid: [[1,0],[0,1]] };
    const mockRoom = { send: jest.fn(), state: { onChange: jest.fn() } };
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    render(<PhaserGame gameState={mockGameState} room={mockRoom} />);
    const canvas = screen.getByTestId('phaser-game');
    fireEvent.focus(canvas);
    fireEvent.keyDown(canvas, { key: 'ArrowUp' });
    expect(consoleSpy).toHaveBeenCalledWith('Key pressed:', 'ArrowUp');
    consoleSpy.mockRestore();
  });

  it('sends movement delta on keydown', () => {
    const mockRoom = { send: jest.fn(), state: { onChange: jest.fn() } };
    const mockGameState = { grid: [[1,0],[0,1]] };
    render(<PhaserGame gameState={mockGameState} room={mockRoom} />);
    const canvas = screen.getByTestId('phaser-game');
    fireEvent.focus(canvas);
    fireEvent.keyDown(canvas, { key: 'ArrowRight' });
    expect(mockRoom.send).toHaveBeenCalledWith('move', { dx: 1, dy: 0 });
    fireEvent.keyDown(canvas, { key: 'ArrowDown' });
    expect(mockRoom.send).toHaveBeenCalledWith('move', { dx: 0, dy: 1 });
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