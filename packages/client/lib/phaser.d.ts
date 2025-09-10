declare module 'phaser' {
  export = Phaser;
  namespace Phaser {
    class Scene {
      add: {
        graphics(): Graphics;
        rectangle(x: number, y: number, width: number, height: number, color: number): Rectangle;
      };
      grid: number[][];
      // Add other properties
    }
    class Game {
      constructor(config: any);
      destroy(destroyRenderer: boolean): void;
      scene: {
        start(key: string, data: any): void;
      };
    }
    interface Types {
      Core: {
        GameConfig: any;
      };
      Input: {
        Keyboard: {
          CursorKeys: {
            up: { isDown: boolean };
            down: { isDown: boolean };
            left: { isDown: boolean };
            right: { isDown: boolean };
          };
        };
      };
    }
    class AUTO {}
    class Graphics {
      fillStyle(color: number, alpha: number): Graphics;
      fillRect(x: number, y: number, width: number, height: number): Graphics;
    }
    class Rectangle {
      setOrigin(originX: number, originY?: number): Rectangle;
    }
    // Basic for now
  }
}