declare module 'phaser' {
  export = Phaser;
  export namespace Phaser {
    export class Scene {
      constructor(config?: { key: string });
      add: {
        graphics(): GameObjects.Graphics;
        rectangle(x: number, y: number, width: number, height: number, color: number): GameObjects.Rectangle;
      };
      input: {
        keyboard?: {
          createCursorKeys(): Types.Input.Keyboard.CursorKeys;
        };
      };
      scale: {
        width: number;
        height: number;
      };
      grid: number[][];
    }
    export class Game {
      constructor(config: any);
      destroy(destroyRenderer: boolean): void;
      scene: {
        start(key: string, data?: any): void;
        getScene(key: string): Scene;
      };
    }
    export namespace GameObjects {
      export class Rectangle {
        constructor(scene: Scene, x: number, y: number, width: number, height: number, color?: number);
        setOrigin(originX: number, originY?: number): this;
        x: number;
        y: number;
      }
      export class Graphics {
        fillStyle(color: number, alpha: number): this;
        fillRect(x: number, y: number, width: number, height: number): this;
        clear(): this;
        setDepth(depth: number): this;
      }
    }
    export namespace Types {
      export namespace Input {
        export namespace Keyboard {
          export class CursorKeys {
            up: { isDown: boolean };
            down: { isDown: boolean };
            left: { isDown: boolean };
            right: { isDown: boolean };
          }
        }
      }
    }
    export class AUTO {}
  }
}