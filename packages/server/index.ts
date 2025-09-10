import "reflect-metadata";
import { Server } from "colyseus";
import { createServer } from "http";
import express from "express";
import { MazeRaceRoom } from "./rooms/MazeRaceRoom";

const port = Number(process.env.PORT || 2567);
const app = express();
app.use(express.json());

const gameServer = new Server({
  server: createServer(app),
});

// Register your room handlers
gameServer.define("maze_race", MazeRaceRoom);

gameServer.listen(port);
console.log(`Listening on ws://localhost:${port}`);
