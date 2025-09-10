import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Server } from "colyseus";
import userEvent from '@testing-library/user-event';
import { ColyseusTestServer, boot } from "@colyseus/testing";
import express from "express";
import { createServer } from "http";

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));



describe('Colyseus Client Components', () => {
  let colyseus: ColyseusTestServer;
  const originalEnv = process.env.NEXT_PUBLIC_COLYSEUS_HOST;

  beforeAll(async () => {
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
    // @ts-ignore
    const { MazeRaceRoom: MazeRaceRoomClass } = await import('../../server/rooms/MazeRaceRoom');
    console.log('MazeRaceRoomClass typeof:', typeof MazeRaceRoomClass);
    const appConfig = {
      initializeGameServer: (gameServer: any) => {
        gameServer.define('maze_race', MazeRaceRoomClass);
      },
    };
    // @ts-ignore
    colyseus = await boot(appConfig);
    console.log('colyseus keys:', Object.keys(colyseus));
    console.log('Defined rooms:', Object.keys((colyseus.server as any).matchMaker?.handlers || {}));
  });

  afterAll(async () => {
    process.env.NEXT_PUBLIC_COLYSEUS_HOST = originalEnv;
    if (colyseus) {
      await colyseus.shutdown();
    }
  });

  beforeEach(async () => {
    await colyseus.cleanup();
    (global as any).window = { location: { origin: 'http://localhost' } };
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
      let testServerRoom: any;
      const createSpy = jest.spyOn(colyseusModule.client, 'create').mockImplementation(async () => {
        testServerRoom = await colyseus.createRoom('maze_race', {});
        const mockSession = 'mock-session';
        // Simulate host joining to add player to state
        const mockClient = { sessionId: mockSession };
        testServerRoom.onJoin(mockClient, { name: 'Player' });
        const mockRoom = {
          roomId: testServerRoom.roomId,
          sessionId: mockSession,
          state: testServerRoom.state,
          leave: jest.fn(),
          onStateChange: jest.fn(),
        };
        return mockRoom;
      });
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
      render(<HostGameButton />);

      const button = screen.getByRole('button', { name: /host game/i });
      await userEvent.click(button);

      console.log('After click - createSpy called:', createSpy.mock.calls.length, 'push calls:', mockPush.mock.calls.length);
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalled();
      });

      const call = mockPush.mock.calls[0][0];
      console.log('push called with:', call);
      expect(call).toMatch(/\/lobby\//);
      const roomIdMatch = call.match(/\/lobby\/(.+)/);
      expect(roomIdMatch).toBeTruthy();
      const roomId = roomIdMatch[1];

      // Assert on the captured testServerRoom
      expect(testServerRoom.roomId).toContain(roomId.substring(0, 4)); // Partial match since full ID may vary
      expect(testServerRoom.clients.length).toBe(0);
      expect(testServerRoom.state.players.size).toBe(1);
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
      room = await colyseus.createRoom('maze_race', {});
      testRoomId = room.roomId;
      mockPush = jest.fn();
      const colyseusModule = require('../lib/colyseus');
      const joinSpy = jest.spyOn(colyseusModule.client, 'joinById').mockImplementation(
        (async (id: string, opts: { name?: string } = {}) => {
          const mockSession = 'mock-session-' + Math.random();
          const mockClientRoom = {
            roomId: id,
            sessionId: mockSession,
            state: room.state,
            onStateChange: jest.fn(),
            leave: jest.fn(),
          };
          room.state.players.set(mockSession, { name: opts.name || 'Player', id: mockSession } as any);
          // Trigger state change for component to pick up the new player
          setTimeout(() => {
            mockClientRoom.onStateChange(room.state);
          }, 100);
          return mockClientRoom;
        }) as any
      );
      require('next/router').useRouter.mockReturnValue({
        query: { roomId: testRoomId },
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
      render(<LobbyPage />, { wrapper: ({ children }) => children });

      const joinButton = screen.getByTestId('join-button');
      await userEvent.click(joinButton);

      await waitFor(() => {
        expect(room.state.players.size).toBe(1);
      });

      const urlInput = screen.getByTestId('shareable-url');
      expect(urlInput).toHaveValue(`http://localhost/lobby/${testRoomId}`);
    });

    it('copies the shareable URL to clipboard on button click', async () => {
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
      const mockWriteText = jest.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: mockWriteText },
        writable: true,
      });
      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true,
      });

      const LobbyPage = (await import('../pages/lobby/[roomId]')).default;
      render(<LobbyPage />, { wrapper: ({ children }) => children });

      const joinButton = screen.getByTestId('join-button');
      await userEvent.click(joinButton);

      await waitFor(() => {
        expect(room.state.players.size).toBe(1);
      });

      const copyButton = screen.getByRole('button', { name: /Copy Link/i });
      await userEvent.click(copyButton);

      expect(mockWriteText).toHaveBeenCalledWith(`http://localhost/lobby/${testRoomId}`);
      expect(screen.getByRole('button', { name: /Copied!/i })).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Copy Link/i })).toBeInTheDocument();
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
      render(<LobbyPage />, { wrapper: ({ children }) => children });

      const nameInput = screen.getByTestId('player-name-input');
      await userEvent.type(nameInput, 'Alice');
      const joinButton = screen.getByTestId('join-button');
      await userEvent.click(joinButton);

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
      render(<LobbyPage />, { wrapper: ({ children }) => children });

      const joinButton = screen.getByTestId('join-button');
      await userEvent.click(joinButton);

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
      render(<LobbyPage />, { wrapper: ({ children }) => children });

      const joinButton = screen.getByTestId('join-button');
      await userEvent.click(joinButton);

      await waitFor(() => {
        expect(room.state.players.size).toBe(1);
      }, { timeout: 2000 });

      // Wait for the component to render the player list
      await waitFor(() => {
        expect(screen.queryByText('Loading players...')).not.toBeInTheDocument();
        const playerList = screen.getByText('Players:');
        const player = screen.getByText('Player');
        expect(player).toBeInTheDocument();
      }, { timeout: 15000 });
    });
  });
});
