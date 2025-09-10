import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import '@testing-library/jest-dom';
import { Server } from "colyseus";
import userEvent from '@testing-library/user-event';
import express from "express";
import { createServer } from "http";
import { GameState, Player } from '@/shared/types';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));


describe('Colyseus Client Components', () => {
  const originalEnv = process.env.NEXT_PUBLIC_COLYSEUS_HOST;

  beforeAll(() => {
    Object.defineProperty(window, 'navigator', {
      value: {
        clipboard: {
          writeText: jest.fn().mockResolvedValue(undefined),
        },
        userAgent: 'Mozilla/5.0 (jsdom)',
      },
      writable: true,
    });
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      writable: true,
    });
    Object.defineProperty(window, 'location', {
      value: { origin: 'http://localhost' },
      writable: true
    });
    process.env.NEXT_PUBLIC_COLYSEUS_HOST = 'ws://localhost:2567';
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_COLYSEUS_HOST = originalEnv;
  });

  describe('HostGameButton', () => {
    let mockPush: jest.Mock;

    beforeEach(() => {
      mockPush = jest.fn();
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
      const colyseusModule = require('../lib/colyseus');
      const mockRoomId = 'test-room-id';
      const mockState = new GameState();
      const hostPlayer = new Player();
      hostPlayer.id = 'mock-host-session';
      hostPlayer.name = 'Player';
      mockState.players.set('mock-host-session', hostPlayer);
      const createSpy = jest.spyOn(colyseusModule.client, 'create').mockResolvedValue({
        roomId: mockRoomId,
        sessionId: 'mock-host-session',
        state: mockState,
        leave: jest.fn(),
        onStateChange: (callback: any) => callback(mockState),
      } as any);
      
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
      const { HostGameButton } = await import('../app/components/HostGameButton');
      await act(async () => {
        render(<HostGameButton />);
      });
      
      const button = screen.getByRole('button', { name: /host game/i });
      await userEvent.click(button);
      
      console.log('After click - createSpy called:', createSpy.mock.calls.length, 'push calls:', mockPush.mock.calls.length);
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(`/lobby/${mockRoomId}?host=true`);
      });
      createSpy.mockRestore();
    });

    it('should log error on room creation failure', async () => {
      const colyseusModule = require('../lib/colyseus');
      const createSpy = jest.spyOn(colyseusModule.client, 'create').mockRejectedValueOnce(new Error('Connection failed'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const { HostGameButton } = await import('../app/components/HostGameButton');
      render(<HostGameButton />);

      const button = screen.getByRole('button', { name: /host game/i });
      await userEvent.click(button);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to create room', expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('LobbyPage', () => {
    let mockPush: jest.Mock;
    let testRoomId: string;
    let room: any;

    beforeEach(async () => {
      // Mock the room creation for lobby tests to avoid real server instantiation
      const mockState = new GameState();
      const mockRoom = {
        roomId: 'mock-room-id',
        state: mockState,
        onMessage: jest.fn(),
        onStateChange: jest.fn(),
        leave: jest.fn(),
      };
      room = mockRoom;
      testRoomId = mockRoom.roomId;
      mockPush = jest.fn();
      const colyseusModule = require('../lib/colyseus');
      const joinSpy = jest.spyOn(colyseusModule.client, 'joinById').mockImplementation(
        (async (id: string, opts: { name?: string } = {}) => {
          const mockSession = 'mock-session-' + Math.random();
          const mockPlayer = new Player();
          mockPlayer.id = mockSession;
          mockPlayer.name = opts.name || 'Player';
          mockPlayer.x = 0;
          mockPlayer.y = 0;
          mockPlayer.startX = 0;
          mockPlayer.startY = 0;
          mockState.players.set(mockSession, mockPlayer);
          const mockClientRoom = {
            roomId: id,
            sessionId: mockSession,
            state: mockState,
            onStateChange: (callback: any) => {
              // Immediately call the callback with current state
              callback(mockState);
            },
            onMessage: jest.fn(),
            leave: jest.fn(),
            send: jest.fn(),
          };
          return mockClientRoom;
        }) as any
      );
      require('next/router').useRouter.mockReturnValue({
        query: { roomId: testRoomId, host: 'true' }, // Add host query param for URL display
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
        hash: '',
        forward: jest.fn(),
        refresh: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        reload: jest.fn(),
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('displays the shareable URL correctly', async () => {
      // Mock global room for host auto-join
      const mockState = room.state;
      const globalRoom = {
        ...room,
        state: mockState,
      };
      (window as any).room = globalRoom;

      require('next/router').useRouter.mockReturnValue({
        query: { roomId: testRoomId, host: 'true' },
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
        hash: '',
        forward: jest.fn(),
        refresh: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        reload: jest.fn(),
      });

      const LobbyPage = (await import('../pages/lobby/[roomId]')).default;
      await act(async () => {
        render(<LobbyPage />, { wrapper: ({ children }) => children });
      });
      
      // For host mode, URL should be visible immediately after auto-join
      await waitFor(() => {
        const urlInput = screen.getByTestId('shareable-url');
        expect(urlInput).toHaveValue(`http://localhost/lobby/${testRoomId}`);
      }, { timeout: 5000 });
    });

    it('copies the shareable URL to clipboard on button click', async () => {
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
      });
      // Ensure secure context for clipboard API
      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true,
      });

      // Mock global room for host auto-join with onStateChange trigger
      const mockState = room.state;
      const onStateChangeCallback = jest.fn();
      const globalRoom = {
        ...room,
        state: mockState,
        onStateChange: (callback: any) => {
          onStateChangeCallback.mockImplementation(callback);
          // Trigger initial state change
          callback(mockState);
        },
      };
      (window as any).room = globalRoom;

      require('next/router').useRouter.mockReturnValue({
        query: { roomId: testRoomId, host: 'true' },
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
        hash: '',
        forward: jest.fn(),
        refresh: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        reload: jest.fn(),
      });
      
      const { default: LobbyPage } = await import('../pages/lobby/[roomId]');
      await act(async () => {
        render(<LobbyPage />);
      });
      
      // Wait for URL to be set and lobby content to render
      await waitFor(() => {
        expect(screen.getByTestId('shareable-url')).toBeInTheDocument();
      });
      
      const copyButton = screen.getByRole('button', { name: /Copy Link/i });
      await act(async () => {
        await userEvent.click(copyButton);
      });
      
      expect(mockWriteText).toHaveBeenCalledWith(`http://localhost/lobby/${testRoomId}`);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copied!/i })).toBeInTheDocument();
      }, { timeout: 3000 });
      
    });

    it('renders join form and handles custom name input', async () => {
      require('next/router').useRouter.mockReturnValue({
        query: { roomId: testRoomId },
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
        hash: '',
        forward: jest.fn(),
        refresh: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        reload: jest.fn(),
      });
      const LobbyPage = (await import('../pages/lobby/[roomId]')).default;
      await act(async () => {
        render(<LobbyPage />, { wrapper: ({ children }) => children });
      });

      const nameInput = screen.getByTestId('player-name-input');
      await act(async () => {
        await userEvent.type(nameInput, 'Alice');
      });
      const joinButton = screen.getByTestId('join-button');
      await act(async () => {
        await userEvent.click(joinButton);
      });

      await waitFor(() => {
        expect(room.state.players.size).toBe(1);
      });

      const player = Array.from(room.state.players.values())[0] as any;
      expect(player.name).toBe('Alice');
    });

    it('joins with default name if input empty', async () => {
      require('next/router').useRouter.mockReturnValue({
        query: { roomId: testRoomId },
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
        hash: '',
        forward: jest.fn(),
        refresh: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        reload: jest.fn(),
      });
      const LobbyPage = (await import('../pages/lobby/[roomId]')).default;
      await act(async () => {
        render(<LobbyPage />, { wrapper: ({ children }) => children });
      });

      const joinButton = screen.getByTestId('join-button');
      await act(async () => {
        await userEvent.click(joinButton);
      });

      await waitFor(() => {
        expect(room.state.players.size).toBe(1);
      });

      const player = Array.from(room.state.players.values())[0] as any;
      expect(player.name).toBe('Player');
    });

    it('displays player names in list after join', async () => {
      require('next/router').useRouter.mockReturnValue({
        query: { roomId: testRoomId },
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
        hash: '',
        forward: jest.fn(),
        refresh: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        reload: jest.fn(),
      });

      const LobbyPage = (await import('../pages/lobby/[roomId]')).default;
      await act(async () => {
        render(<LobbyPage />, { wrapper: ({ children }) => children });
      });
      
      const joinButton = screen.getByTestId('join-button');
      await act(async () => {
        await userEvent.click(joinButton);
      });
      
      await waitFor(() => {
        expect(screen.queryByText('Loading players...')).not.toBeInTheDocument();
        const playerName = screen.getByText('Player');
        expect(playerName).toBeInTheDocument();
      });
    });
  });
});
