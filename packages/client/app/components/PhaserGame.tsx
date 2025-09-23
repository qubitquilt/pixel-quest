'use client';

import { useEffect, useRef } from 'react';
import * as Phaser from 'phaser';
import { Player } from 'shared/types';

interface Props {}

interface OtherPlayer {
  // Deferred for multiplayer

  x: number;
  y: number;
  direction: string;
}

class FlashlightScene extends Phaser.Scene {
  player: Phaser.Physics.Arcade.Sprite | null = null;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  walls: Phaser.Physics.Arcade.StaticGroup | null = null;





  tileSize: number = 32;
  playerX: number = 1;
  playerY: number = 1;
  isMoving: boolean = false;
  moveSpeed: number = 200;
  rotationSpeed: number = Phaser.Math.DegToRad(180);
  keys: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key; } | null = null;
  visualCones: Phaser.GameObjects.Graphics | null = null;


  // --- Properties for the cone flashlight ---
  cover: Phaser.GameObjects.Graphics | null = null;
  flashlightGraphics: Phaser.GameObjects.Graphics | null = null;
  targetAngle: number = 0;
  currentAngle: number = 0;
  lastDirection: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 1); // default down

  // Prototype single-player
  roundState: string = 'playing';
  direction: string = 'down';
  grid: number[][] = [];

  TILE_SIZE: number = 32;
  MAZE_WIDTH_TILES: number = 20;
  MAZE_HEIGHT_TILES: number = 15;

  constructor() {
    super({ key: 'FlashlightScene' });
  }

  preload() {
    // No external assets are needed.
  }

  create() {
    const mazeWidth = 20 * this.tileSize;
    const mazeHeight = 15 * this.tileSize;

    // --- Floor Setup ---
    const floorGraphics = this.make.graphics();
    floorGraphics.fillStyle(0x444444);
    floorGraphics.fillRect(0, 0, this.tileSize, this.tileSize);
    floorGraphics.generateTexture('floor_tile', this.tileSize, this.tileSize);
    floorGraphics.destroy();

    this.add.tileSprite(0, 0, mazeWidth, mazeHeight, 'floor_tile')
      .setOrigin(0, 0)
      .setDepth(-1)
      .setTint(0x888888);

    // --- Player Setup ---
    this.player = this.physics.add.sprite(100, 100, 'player');
    const playerGraphics = this.make.graphics();
    playerGraphics.fillStyle(0x00aaff);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    this.player.setTexture('player');
    this.player.setCollideWorldBounds(true);
    this.physics.world.setBounds(0, 0, mazeWidth, mazeHeight);

    // --- Maze and Walls Setup ---
    this.walls = this.physics.add.staticGroup();
    this.createMaze(20, 15, this.tileSize);
    this.physics.add.collider(this.player, this.walls);

    // --- Flashlight Mask Setup ---
    // Set alpha to 1 for a completely black fog of war
    this.cover = this.add.graphics({ fillStyle: { color: 0x000000, alpha: 1.0 } });
    this.cover.fillRect(0, 0, mazeWidth, mazeHeight);
    this.cover.setDepth(1);

    this.flashlightGraphics = this.make.graphics({ add: false });
    const mask = this.flashlightGraphics.createGeometryMask();
    this.cover.setMask(mask);
    mask.invertAlpha = true;

    // --- Direction Tracking ---
    this.lastDirection = new Phaser.Math.Vector2(1, 0);
    this.targetAngle = this.lastDirection.angle();
    this.currentAngle = this.targetAngle;

    // --- Controls & Camera ---
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // --- Static Camera Setup ---
    this.cameras.main.setBounds(0, 0, mazeWidth, mazeHeight);
    // Fixed zoom for prototype
     
    this.cameras.main.setZoom(1);
  }


  createMaze(width: number, height: number, tileSize: number) {
    this.grid = Array.from({ length: height }, () => Array(width).fill(0)); // All walls initially

    const stack: { x: number; y: number }[] = [];
    const startX = 1;
    const startY = 1;
    this.grid[startY][startX] = 1; // Starting path
    stack.push({ x: startX, y: startY });

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(current.x, current.y);

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        this.removeWall(current, next);
        this.grid[next.y][next.x] = 1;
        stack.push(next);
      } else {
        stack.pop();
      }
    }

    // Render walls
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (this.grid[y][x] === 0) {
          // Wall graphics
          const wallGraphic = this.add.graphics();
          wallGraphic.fillStyle(0xaaaaaa, 1);
          wallGraphic.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
          wallGraphic.setDepth(0);

          // Physics body
          const wallBody = this.walls!.create(
            x * tileSize + tileSize / 2,
            y * tileSize + tileSize / 2
          );
          wallBody.body!.setSize(tileSize, tileSize);
          wallBody.body!.immovable = true;
        }
      }
    }

    // Set player start position
    this.playerX = startX;
    this.playerY = startY;
    if (this.player) {
      this.player.setPosition(
        startX * tileSize + tileSize / 2,
        startY * tileSize + tileSize / 2
      );
    }
  }

  private getUnvisitedNeighbors(x: number, y: number): { x: number; y: number }[] {
    const neighbors: { x: number; y: number }[] = [];
    const directions = [
      [0, -2],
      [2, 0],
      [0, 2],
      [-2, 0]
    ];

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (
        nx > 0 &&
        nx < this.grid[0].length - 1 &&
        ny > 0 &&
        ny < this.grid.length - 1 &&
        this.grid[ny][nx] === 0
      ) {
        neighbors.push({ x: nx, y: ny });
      }
    }
    return neighbors;
  }

  private removeWall(current: { x: number; y: number }, next: { x: number; y: number }) {
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    const wallX = current.x + dx / 2;
    const wallY = current.y + dy / 2;
    this.grid[wallY][wallX] = 1;
  }
}

const PhaserGame = ({ room, sessionId }: Props) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const gameInstanceRef = useRef<any>(null);

  useEffect(() => {
    try {
      if (!gameRef.current) return;

      if (!room || !room.state) {
        console.warn('PhaserGame init: Room or state incomplete, deferring game creation');
        return;
      }

      let game: any = null;

      const config = {
        type: Phaser.AUTO,
        parent: gameRef.current,
        width: 800,
        height: 600,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
          }
        },
        scene: FlashlightScene
      };

      game = new Phaser.Game(config);
      gameInstanceRef.current = game;

      return () => {
        if (game) {
          game.destroy(true);
        }
      };
    } catch (error) {
      console.error('PhaserGame init error:', error);
    }
  }, []);

  return <div ref={gameRef} style={{ width: '100%', height: '100%' }} />;
};

export default PhaserGame;