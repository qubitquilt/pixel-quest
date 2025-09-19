import "reflect-metadata";

import { Client } from "colyseus";
import { MazeRaceRoom } from "../rooms/MazeRaceRoom";

describe('Broadcast behavior', () => {
  let room: MazeRaceRoom;
  let hostClient: Client;
  let guestClient: Client;

  beforeEach(() => {
    room = new MazeRaceRoom();
    room.onCreate({});

    hostClient = ({ sessionId: 'host-session', auth: {}, send: jest.fn(), onMessage: jest.fn(), id: 'host-id' } as unknown) as Client;
    guestClient = ({ sessionId: 'guest-session', auth: {}, send: jest.fn(), onMessage: jest.fn(), id: 'guest-id' } as unknown) as Client;

    room.onJoin(hostClient, { name: 'Host' });
    room.onJoin(guestClient, { name: 'Guest' });

    // Start game and deterministic treasure
    room.onStartGame(hostClient, {});
    const state: any = room.state;
    state.treasureIndex = 1 * state.mazeWidth + 1;
    state.grid[state.treasureIndex] = 1;
  });

  it('broadcasts roundOver exactly once with correct payload under concurrent arrivals', () => {
    // Spy on broadcast
    const spy = jest.spyOn(room as any, 'broadcast');

    const state: any = room.state;
    const host = state.players.get('host-session');
    const guest = state.players.get('guest-session');

    // Place both adjacent
    host.x = 0; host.y = 1;
    guest.x = 2; guest.y = 1;
    state.grid[host.y * state.mazeWidth + host.x] = 1;
    state.grid[guest.y * state.mazeWidth + guest.x] = 1;

    // Simulate concurrent moves
    (room as any).handleMove(hostClient, { dx: 1, dy: 0 });
    (room as any).handleMove(guestClient, { dx: -1, dy: 0 });

    // broadcast should have been called exactly once with 'roundOver' and payload containing winnerId
    const calls = spy.mock.calls.filter((c: any[]) => c[0] === 'roundOver');
    expect(calls.length).toBe(1);
    const payload = calls[0][1];
    expect(payload).toHaveProperty('winnerId');
    expect([host.id, guest.id]).toContain(payload.winnerId);

    spy.mockRestore();
  });
  afterEach(() => { room.onDispose(); });

});
