import "reflect-metadata";
import { Player, GameState } from "shared";
new Player(); // Force schema metadata initialization
new GameState(); // Force schema metadata initialization

const originalLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});
afterAll(() => {
  console.log = originalLog;
});

export {};
