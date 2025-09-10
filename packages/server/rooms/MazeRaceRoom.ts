import "reflect-metadata";
import { Room, Client } from "colyseus";
import { GameState, Player } from "../../shared/dist/index";

export class MazeRaceRoom extends Room<GameState> {
  onCreate(options: any) {
    this.state = new GameState();

    console.log("MazeRaceRoom created!", options);
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const player = new Player().assign({
      id: client.sessionId,
      name: options.name || "Player",
      x: Math.floor(Math.random() * 10),
      y: Math.floor(Math.random() * 10),
    });

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log("MazeRaceRoom.onLeave called for client:", client.sessionId, "consented:", consented);
    this.state.players.delete(client.sessionId);
    console.log("Players after leave:", Array.from(this.state.players.values()).map(p => p.name));
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
