import "reflect-metadata";
import { Schema, MapSchema, type } from "@colyseus/schema";

export type PowerUpType = 'SpeedBoost' | 'BrighterFlashlight' | 'XRayVision' | 'Blackout';

export class Player extends Schema {
  @type("string") id: string = "";
  @type("string") name: string = "";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("boolean") isWinner: boolean = false;
  @type("string") currentPowerUp: PowerUpType = "SpeedBoost";
  @type("number") roundScore: number = 0;
  @type("number") matchScore: number = 0;
}

export class PowerUp extends Schema {
  @type("string") id: string = "";
  @type("string") type: PowerUpType = "SpeedBoost";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
}

export class GameState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type({ map: PowerUp }) powerUps = new MapSchema<PowerUp>();
  @type([["number"]]) maze: number[][] = [];
  @type("number") treasureValue: number = 100;
  @type("string") roundState: 'waiting' | 'playing' | 'summary' = 'waiting';
  @type("number") round: number = 1;
  @type("number") totalRounds: number = 3;
}