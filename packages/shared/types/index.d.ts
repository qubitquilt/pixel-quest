import "reflect-metadata";
import { Schema, MapSchema } from "@colyseus/schema";
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
export declare class Player extends Schema {
    id: string;
    name: string;
    x: number;
    y: number;
    startX: number;
    startY: number;
}
export declare class GameState extends Schema {
    roundState: string;
    players: MapSchema<Player, string>;
    mazeWidth: number;
    mazeHeight: number;
    grid: number[][];
    root: GameState;
    constructor();
}
