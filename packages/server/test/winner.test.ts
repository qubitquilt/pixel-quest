import "reflect-metadata";

import { Client } from "colyseus";
import { MazeRaceRoom } from "../rooms/MazeRaceRoom";

describe('Winner detection', () => {
  let room: MazeRaceRoom;
  let hostClient: Client;
  let guestClient: Client;

  beforeEach(() => {
    jest.useFakeTimers();
    room = new MazeRaceRoom();
    room.onCreate({});

    hostClient = ({ sessionId: 'host-session', auth: {}, send: jest.fn(), onMessage: jest.fn(), id: 'host-id' } as unknown) as Client;
    guestClient = ({ sessionId: 'guest-session', auth: {}, send: jest.fn(), onMessage: jest.fn(), id: 'guest-id' } as unknown) as Client;

    room.onJoin(hostClient, { name: 'Host' });
    room.onJoin(guestClient, { name: 'Guest' });

    // Start game and ensure deterministic grid for tests
    room.onStartGame(hostClient, {});

    const state: any = room.state;
    // Place treasure explicitly at cell (1,1)
    state.treasureIndex = 1 * state.mazeWidth + 1;
    // Ensure that cell is a path
    state.grid[state.treasureIndex] = 1;
  });

  afterEach(() => {
    jest.runAllTimers();
    jest.useRealTimers();
  });

  it('detects winner when player moves onto treasure', () => {
    const state: any = room.state;
    const guest = state.players.get('guest-session');
    // Move guest to (1,1) from start (1,0)
    (room as any).handleMove(guestClient, { dx: 0, dy: 1 });

    jest.advanceTimersByTime(1000); // Check before timeout resets to 'waiting'

    expect(state.roundWinnerId).toBe(guest.id);
    expect(state.roundState).toBe('round_over');
  });

  it('records only first winner under concurrent moves', () => {
    const state: any = room.state;

    // Place both players adjacent to treasure
    const host = state.players.get('host-session');
    const guest = state.players.get('guest-session');
    // Put host at (0,1) and guest at (2,1) so both can move into (1,1)
    host.x = 0; host.y = 1;
    guest.x = 2; guest.y = 1;
    // Ensure those positions are paths
    state.grid[host.y * state.mazeWidth + host.x] = 1;
    state.grid[guest.y * state.mazeWidth + guest.x] = 1;

    // Simulate concurrent moves: both move dx towards center
    (room as any).handleMove(hostClient, { dx: 1, dy: 0 });
    (room as any).handleMove(guestClient, { dx: -1, dy: 0 });

    jest.advanceTimersByTime(1000); // Check before timeout resets to 'waiting'

    // Exactly one winner set
    expect(state.roundWinnerId).toBeTruthy();
    const winnerId = state.roundWinnerId;
    expect([host.id, guest.id]).toContain(winnerId);

    // Ensure roundState is round_over
    expect(state.roundState).toBe('round_over');
  });
});
