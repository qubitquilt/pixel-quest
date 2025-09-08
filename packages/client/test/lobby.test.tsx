import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { HostGameButton } from '@/app/components/HostGameButton';
import LobbyPage from '../pages/lobby/[roomId]';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    prefetches: new Map(),
    events: {
      emit: jest.fn(),
      off: jest.fn(),
      on: jest.fn(),
    },
    isFallback: false,
    asPath: '',
    basePath: '',
    pathname: '/',
    route: '/',
    query: {},
    hash: '',
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    reload: jest.fn(),
  })),
}));

import { GameState } from '../../shared/types/index';
const mockGameState = new GameState();

jest.mock('@/lib/colyseus', () => ({
  client: {
    create: jest.fn(),
    joinById: jest.fn(),
  },
}));

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));


describe('HostGameButton', () => {
  const mockPush = jest.fn();
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mockClient = require('@/lib/colyseus').client;
    mockClient.create.mockResolvedValue({ id: 'mockRoomId' });
    require('next/navigation').useRouter.mockReturnValue({
      push: mockPush,
      prefetches: new Map(),
      events: {
        emit: jest.fn(),
        off: jest.fn(),
        on: jest.fn(),
      },
      isFallback: false,
      asPath: '',
      basePath: '',
      pathname: '/',
      route: '/',
      query: {},
      hash: '',
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
      reload: jest.fn(),
    });
  });

  it('should create room and navigate to lobby on success', async () => {
    render(<HostGameButton />);

    const button = screen.getByRole('button', { name: /host game/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(mockClient.create).toHaveBeenCalledWith('maze_race');
      expect(mockPush).toHaveBeenCalledWith('/lobby/mockRoomId');
    });
  });

  it('should log error on room creation failure', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockClient.create.mockRejectedValue(new Error('Connection failed'));

    render(<HostGameButton />);

    const button = screen.getByRole('button', { name: /host game/i });
    await userEvent.click(button);

    await waitFor(() => {
      expect(mockClient.create).toHaveBeenCalledWith('maze_race');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create room', expect.any(Error));
    });

    consoleErrorSpy.mockRestore();
  });
});

describe('LobbyPage', () => {
  const mockPush = jest.fn();
  let mockClient;
  let mockRoom;
  let mockOnStateChange;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnStateChange = jest.fn();
    mockRoom = {
      id: 'testRoomId',
      onStateChange: (cb: (state: any) => void) => {
        cb(mockGameState);
      },
      leave: jest.fn(),
    };
    mockClient = require('@/lib/colyseus').client;
    mockClient.joinById.mockResolvedValue(mockRoom);
    require('next/router').useRouter.mockReturnValue({ query: { roomId: 'testRoomId' }, push: mockPush });
    global.window = { location: { origin: 'http://localhost' } } as any;
  });

  it('displays the shareable URL correctly', async () => {
    render(<LobbyPage />);

    await waitFor(() => {
      expect(mockClient.joinById).toHaveBeenCalledWith('testRoomId');
    });

    await waitFor(() => {
      expect(screen.getByLabelText('Shareable URL:')).toHaveValue('http://localhost/lobby/testRoomId');
    });
  });

  it('copies the shareable URL to clipboard on button click', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
    });
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      writable: true,
    });

    render(<LobbyPage />);

    await waitFor(() => {
      expect(mockClient.joinById).toHaveBeenCalledWith('testRoomId');
    });

    const copyButton = screen.getByRole('button', { name: /Copy Link/i });
    await userEvent.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith('http://localhost/lobby/testRoomId');
    expect(screen.getByRole('button', { name: /Copied!/i })).toBeInTheDocument();

    // Wait for timeout to reset
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Copy Link/i })).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
