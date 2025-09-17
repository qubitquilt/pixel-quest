import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { Room } from 'colyseus.js';
import { GameState } from '@/shared/types';
import { client } from '@/lib/colyseus';
import GamePage from '../pages/game/[roomId]';

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock colyseus client
jest.mock('@/lib/colyseus', () => ({
  client: {
    joinById: jest.fn(),
  },
}));

// Mock dynamic PhaserGame
jest.mock('@/app/components/PhaserGame', () => () => <div data-testid="phaser-game" />);

const mockRouter = {
  query: { roomId: 'test-room-id' },
  route: '/game/[roomId]',
  pathname: '/game/[roomId]',
  asPath: '/game/test-room-id',
  basePath: '',
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
};
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
mockUseRouter.mockReturnValue(mockRouter);

const mockClient = client as jest.Mocked<typeof client>;

const mockPlayer = {
  id: 'player1',
  name: 'Test Player',
  x: 0,
  y: 0,
  startX: 0,
  startY: 0,
};

const mockStateClone = {
  roundState: 'waiting',
  players: new Map([['player1', mockPlayer]]),
  mazeWidth: 10,
  mazeHeight: 10,
  grid: [0, 1, 2],
  root: undefined as any,
  // Mock methods to satisfy GameState
  assign: jest.fn(),
  setDirty: jest.fn(),
  clone: jest.fn(),
  toJSON: jest.fn(),
};

const mockState: any = {
  roundState: 'waiting',
  players: new Map([['player1', mockPlayer]]),
  mazeWidth: 10,
  mazeHeight: 10,
  grid: [0, 1, 2],
  root: undefined as any,
  clone: jest.fn(() => mockStateClone),
  // Mock methods
  assign: jest.fn(),
  setDirty: jest.fn(),
  toJSON: jest.fn(),
};

const mockRoom: any = {
  id: 'test-room-id',
  state: mockState,
  onStateChange: jest.fn((cb: (state: GameState) => void) => {
    // Simulate initial call
    cb(mockState.clone());
  }),
  leave: jest.fn(),
};
mockClient.joinById.mockResolvedValue(mockRoom);

describe('GamePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.joinById.mockResolvedValue(mockRoom);
  });

  it('renders loading initially and joins room once on mount', async () => {
    render(<GamePage />);

    expect(screen.getByText('Loading game...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockClient.joinById).toHaveBeenCalledTimes(1);
      expect(mockClient.joinById).toHaveBeenCalledWith('test-room-id');
      expect(screen.queryByTestId('phaser-game')).toBeInTheDocument();
      expect(screen.getByText('Game: test-room-id')).toBeInTheDocument();
    });

    // Simulate re-render, no additional join
    render(<GamePage />);
    await waitFor(() => {
      expect(mockClient.joinById).toHaveBeenCalledTimes(1); // Still once
    });
  });

  it('handles join error and shows loading or error state', async () => {
    const error = new Error('Join failed');
    mockClient.joinById.mockRejectedValueOnce(error);
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(<GamePage />);

    await waitFor(() => {
      expect(mockClient.joinById).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('Failed to join game room', error);
      // Stays in loading since no state set on error
      expect(screen.getByText('Loading game...')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('calls room.leave on unmount if joined', async () => {
    const leaveSpy = jest.spyOn(mockRoom, 'leave');

    const { unmount } = render(<GamePage />);

    await waitFor(() => {
      expect(mockClient.joinById).toHaveBeenCalledTimes(1);
    });

    unmount();

    expect(leaveSpy).toHaveBeenCalledTimes(1);
  });
});