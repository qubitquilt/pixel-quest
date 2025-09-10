import "reflect-metadata";
import { Schema, type, MapSchema } from "@colyseus/schema";

export class Player extends Schema {
  constructor() {
    super();
  }

  @type("string")
  id: string = "";

  @type("string")
  name: string = "";

  @type("number")
  x: number = 0;

  @type("number")
  y: number = 0;
}

export class GameState extends Schema {
  constructor() {
    super();
  }

  @type("string")
  roundState: string = "waiting";

  @type({ map: Player })
  players = new MapSchema<Player>();
}