declare module 'phaser' {
  export = Phaser;
  export namespace Phaser {
    export class Scene {
      constructor(config?: { key: string });
      add: {
        graphics(): GameObjects.Graphics;
        rectangle(x: number, y: number, width: number, height: number, color: number): GameObjects.Rectangle;
        tileSprite(x: number, y: number, width: number, height: number, textureKey: string): GameObjects.TileSprite;
      };
      make: {
        graphics(): GameObjects.Graphics;
      };
      physics: {
        add: {
          staticGroup(): Physics.Arcade.StaticGroup;
        };
      };
      tweens: {
        add(tweenConfig: any): any;
      };
      input: {
        keyboard?: {
          createCursorKeys(): Types.Input.Keyboard.CursorKeys;
          on(event: string, callback: (event: KeyboardEvent) => void, context?: any): void;
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
        setDepth(depth: number): this;
        x: number;
        y: number;
      }
      export class Graphics {
        constructor(scene: Scene, config?: { add?: boolean; fillStyle?: { color: number; alpha: number } });
        fillStyle(color: number, alpha: number): this;
        fillRect(x: number, y: number, width: number, height: number): this;
        fillPoints(points: Geom.Point[], closePath?: boolean): this;
        clear(): this;
        setDepth(depth: number): this;
        createGeometryMask(): any; // GeometryMask
      }
      export class Sprite {
        getBounds(target?: Geom.Rectangle): Geom.Rectangle;
        body: any;
        setDepth(depth: number): this;
      }
      export class TileSprite {
        setOrigin(x: number, y: number): this;
        setDepth(depth: number): this;
        setTint(color: number): this;
      }
    }
    export namespace Physics {
      export namespace Arcade {
        export class StaticGroup {
          create(x: number, y: number): GameObjects.Sprite;
          getChildren(): GameObjects.Sprite[];
          clear(destroyChildren?: boolean, destroyTexture?: boolean): void;
        }
      }
    }
    export namespace Math {
      export class Vector2 {
        constructor(x?: number, y?: number);
        set(x: number, y: number): this;
        setFromAngle(angle: number): this;
        normalize(): this;
        length(): number;
        angle(): number;
        copy(v: Vector2): this;
      }
      export namespace Angle {
        export function RotateTo(current: number, target: number, step: number): number;
      }
      export function DegToRad(degrees: number): number;
      export namespace Distance {
        export function BetweenPoints(a: Vector2 | Geom.Point, b: Vector2 | Geom.Point): number;
      }
    }
    export namespace Geom {
      export class Line {
        constructor(x1: number, y1: number, x2: number, y2: number);
        getPointB(): Geom.Point;
      }
      export class Point {
        constructor(x: number, y: number);
        x: number;
        y: number;
      }
      export class Rectangle {
        constructor(x?: number, y?: number, width?: number, height?: number);
      }
      export namespace Intersects {
        export function GetLineToRectangle(line: Line, rect: Rectangle): Geom.Point[];
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