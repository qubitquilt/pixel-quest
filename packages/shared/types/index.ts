import "reflect-metadata";
import { Schema, type, MapSchema } from "@colyseus/schema";

// Type definitions for TypeScript
export interface IMaze {
  grid: number[][];
  width: number;
  height: number;
}

export interface IPlayer {
  id: string;
  name: string;
  x: number;
  y: number;
  startX: number;
  startY: number;
}

export interface IGameState {
  roundState: string;
  players: Map<string, IPlayer>;
  mazeWidth: number;
  mazeHeight: number;
  grid: number[][];
}

export interface Maze {
  grid: number[][];
  width: number;
  height: number;
}

export class Player extends Schema {
  @type("string")
  id: string = "";

  @type("string")
  name: string = "";

  @type("number")
  x: number = 0;

  @type("number")
  y: number = 0;

  @type("number")
  startX: number = 0;

  @type("number")
  startY: number = 0;
}

export class GameState extends Schema {
  @type("string")
  roundState: string = "waiting";

  @type({ map: Player })
  players = new MapSchema<Player>();

  @type("number")
  mazeWidth: number = 0;

  @type("number")
  mazeHeight: number = 0;

  @type(["number"])
  grid: number[][] = [];

  root: GameState;

  constructor() {
    super();
    this.root = this;
  }
}