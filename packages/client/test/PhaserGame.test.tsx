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
    constructor(config) {
      this.key = config.key;
      this.data = {};
      this.add = {
        graphics: jest.fn(() => ({
          fillStyle: jest.fn().mockReturnThis(),
          fillRect: jest.fn().mockReturnThis(),
          setDepth: jest.fn().mockReturnThis(),
        })),
        rectangle: jest.fn(() => ({
          setOrigin: jest.fn().mockReturnThis(),
        })),
      };
      this.tweens = { add: jest.fn() };
      this.input = { keyboard: { on: jest.fn() } };
      this.scale = { width: 672, height: 672 };
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
});