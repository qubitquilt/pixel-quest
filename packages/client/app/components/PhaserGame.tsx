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
  player = null;
  cursors = null;
  walls = null;

  grid: number[][] = [];




  tileSize = 32;
  playerX = 1;
  playerY = 1;
  isMoving = false;
  moveSpeed = 200;
  rotationSpeed = Phaser.Math.DegToRad(180);
  keys = null;
  visualCones = null;
  grid: number[][] = [];


  // --- Properties for the cone flashlight ---
  cover = null;
  flashlightGraphics = null;
  targetAngle = 0;
  currentAngle = 0;
  lastDirection = null;

  TILE_SIZE = 64;
  MAZE_WIDTH_TILES = 20;
  MAZE_HEIGHT_TILES = 15;

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
    const zoom = Math.min(this.cameras.main.width / mazeWidth, this.cameras.main.height / mazeHeight);
    this.cameras.main.setZoom(zoom);
    this.cameras.main.centerOn(mazeWidth / 2, mazeHeight / 2);
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





  private handleKeyDown(event: KeyboardEvent) {
    console.log('MazeScene handleKeyDown:', event.key, 'roundState:', this.roundState, 'isMoving:', this.isMoving, 'player:', !!this.player);
    if (this.roundState !== 'playing' || this.isMoving || !this.player) {
      console.log('Movement blocked:', { roundState: this.roundState, isMoving: this.isMoving, hasPlayer: !!this.player });
      return;
    }

    let newX = this.playerX;
    let newY = this.playerY;
    let newDirection = this.direction;

    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        newX -= 1;
        newDirection = 'left';
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        newX += 1;
        newDirection = 'right';
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        newY -= 1;
        newDirection = 'up';
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        newY += 1;
        newDirection = 'down';
        break;
      default:
        return;
    }

    const oldX = this.playerX;
    const oldY = this.playerY;

    console.log('Attempting move from', oldX, oldY, 'to', newX, newY, 'direction:', newDirection);

    // Check bounds and collision (1 = path)
    const inBounds = newX >= 0 && newX < this.grid[0].length && newY >= 0 && newY < this.grid.length;
    const isPath = inBounds ? this.grid[newY][newX] === 1 : false;
    console.log('Collision check:', { newX, newY, inBounds, gridValue: inBounds ? this.grid[newY][newX] : 'OOB', isPath });
    if (inBounds && isPath) {
      // Track for potential server rejection
      this.pendingExpectedX = newX;
      this.pendingExpectedY = newY;
      this.pendingOldX = oldX;
      this.pendingOldY = oldY;
      this.isPendingSync = true;

      this.isMoving = true;
      const targetX = newX * this.tileSize + this.tileSize / 2;
      const targetY = newY * this.tileSize + this.tileSize / 2;

      console.log('Valid move, starting tween to', targetX, targetY);

      // Smooth tween animation
      (this as any).tweens.add({
        targets: this.player,
        x: targetX,
        y: targetY,
        duration: this.moveSpeed,
        ease: 'Linear',
        onComplete: () => {
          console.log('Tween complete, updating position to', newX, newY, 'direction:', newDirection);
          this.playerX = newX;
          this.playerY = newY;
          this.direction = newDirection;
          const dx = newX - oldX;
          const dy = newY - oldY;
          this.lastDirection.set(dx, dy);
          if (this.lastDirection.length() > 0) {
            this.lastDirection.normalize();
          }
          this.targetAngle = this.lastDirection.angle();
          this.isMoving = false;
          if (this.room) {
            console.log('Sending move to server:', { dx: newX - oldX, dy: newY - oldY, direction: newDirection });
            this.room.send('move', {
              dx: newX - oldX,
              dy: newY - oldY,
              direction: newDirection
            });
          }
          this.updateVisibility();
        }
      });
    } else {
      console.log('Invalid move: out of bounds or wall');
      this.shakeEffect();
    }
  }

  }


      // Other players' polygons for union reveal (DEFERRED TO STORY 4.2)
      /*
      this.otherPlayers.forEach((other) => {
        const otherPosX = other.x * this.tileSize + this.tileSize / 2;
        const otherPosY = other.y * this.tileSize + this.tileSize / 2;
        const otherAngle = this.dirToAngle[other.direction as keyof typeof this.dirToAngle];
        const otherPolygon = this.computeVisibilityPolygon(otherPosX, otherPosY, otherAngle);
        if (otherPolygon.length > 2) {
          this.flashlightGraphics.fillPoints(otherPolygon, true);
        }
      });
      */

      // Visual cones overlay
      this.visualCones.clear();

      // Own cone
      this.visualCones.fillStyle(0xffffff, 0.3);
      if (ownPolygon.length > 2) {
        this.visualCones.fillPoints(ownPolygon, true);
      }

      // Other players' cones tinted (DEFERRED TO STORY 4.2)
      /*
      this.otherPlayers.forEach((other) => {
        const otherPosX = other.x * this.tileSize + this.tileSize / 2;
        const otherPosY = other.y * this.tileSize + this.tileSize / 2;
        const otherAngle = this.dirToAngle[other.direction as keyof typeof this.dirToAngle];
        const otherPolygon = this.computeVisibilityPolygon(otherPosX, otherPosY, otherAngle);
        this.visualCones.fillStyle(0x888888, 0.3);
        if (otherPolygon.length > 2) {
          this.visualCones.fillPoints(otherPolygon, true);
        }
      });
      */
    } catch (error) {
      console.error('MazeScene updateVisibility error:', error);
    }
  }

    });
    console.log('Shake effect triggered for move rejection');
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
      role="application"
    />
  );
};

export default PhaserGame;