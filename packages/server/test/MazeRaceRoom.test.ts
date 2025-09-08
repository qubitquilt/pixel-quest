import "reflect-metadata";

import { Client } from "colyseus";
import { MazeRaceRoom } from "../rooms/MazeRaceRoom";

describe("MazeRaceRoom", () => {
  it("should create a new room", () => {
    const room = new MazeRaceRoom();
    room.onCreate({});
    expect(room.state).toBeDefined();
    expect(room.state.roundState).toBe('waiting');
  });

  it("should allow a client to join as host", () => {
    const room = new MazeRaceRoom();
    room.onCreate({});
    const options = { name: "HostPlayer" };
    const mockClient = ({
      sessionId: "mock-session",
      auth: {},
      send: jest.fn(),
      onMessage: jest.fn(),
      id: "mock-client-id",
    } as unknown) as Client;
    room.onJoin(mockClient, options);
    expect(room.state.players.size).toBe(1);
    const player = room.state.players.get("mock-session")!;
    expect(player.name).toBe("HostPlayer");
    expect(typeof player.x).toBe("number");
    expect(typeof player.y).toBe("number");
  });
});
