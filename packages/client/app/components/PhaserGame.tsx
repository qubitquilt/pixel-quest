'use client';

import { useEffect, useRef } from 'react';

import * as Phaser from 'phaser';

interface Props {
  gameState: any;
  room?: any; // Colyseus room for sending movement
}

class MazeScene extends Phaser.Scene {
  grid: number[][] = [];
  player: Phaser.GameObjects.Rectangle | null = null;
  roundState: string = 'waiting';
  playerX = 0;
  playerY = 0;
  tileSize = 32;
  moveSpeed = 200; // ms per move
  direction: string = 'down';
  range: number = 4;
  coneAngle: number = 60;
  fog: Phaser.GameObjects.Graphics | null = null;
  light: Phaser.GameObjects.Graphics | null = null;
  isMoving = false;

  constructor() {
    super({ key: 'MazeScene' });
  }

  init(data: any) {
    // Reshape flat grid to 2D if it's a flat array (from Colyseus serialization)
    let reshapedGrid = data.grid || [];
    if (Array.isArray(reshapedGrid) && reshapedGrid.length === 441) {
      const width = 21;
      this.grid = Array.from({ length: width }, (_, y) =>
        Array.from({ length: width }, (_, x) => reshapedGrid[y * width + x])
      );
    } else {
      this.grid = reshapedGrid;
    }
    this.roundState = data.roundState || 'waiting';
    this.playerX = data.playerX || 1; // Start at (1,1) assuming open path
    this.playerY = data.playerY || 1;
    this.direction = data.direction || 'down';
    this.roundState = data.roundState || 'waiting';
    this.playerX = data.playerX || 1; // Start at (1,1) assuming open path
    this.playerY = data.playerY || 1;
    this.direction = data.direction || 'down';
  }

  preload() {
    // Preload assets if any
  }

  create() {
    if (!this.grid || this.grid.length === 0) return;

    // Render maze from grid data
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        const tile = this.add.graphics();
        const value = this.grid[y][x];
        if (value === 0) {
          // Wall
          tile.fillStyle(0x000000, 1);
        } else {
          // Path
          tile.fillStyle(0xffffff, 1);
        }
        tile.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
      }
    }

    // Add player sprite at starting position
    this.player = this.add.rectangle(
      this.playerX * this.tileSize + this.tileSize / 2,
      this.playerY * this.tileSize + this.tileSize / 2,
      28,
      28,
      0x0000ff
    );
    this.player.setOrigin(0.5);

    // Fog of war overlay
    this.fog = this.add.graphics().setDepth(1);
    this.fog.fillStyle(0x000000, 1);
    this.fog.fillRect(0, 0, this.scale.width, this.scale.height);

    // Light mask for visibility
    this.light = this.add.graphics().setDepth(2);

    // Initial visibility
    this.updateVisibility();

    // Setup keyboard input for local movement
    (this.input.keyboard as any)?.on('keydown', this.handleKeyDown, this);
  }

  private handleKeyDown(event: KeyboardEvent) {
    if (this.roundState !== 'playing' || this.isMoving || !this.player) return;

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

    // Check bounds and collision (1 = path)
    if (
      newX >= 0 &&
      newX < this.grid[0].length &&
      newY >= 0 &&
      newY < this.grid.length &&
      this.grid[newY][newX] === 1
    ) {
      this.isMoving = true;
      const targetX = newX * this.tileSize + this.tileSize / 2;
      const targetY = newY * this.tileSize + this.tileSize / 2;

      // Smooth tween animation
      (this as any).tweens.add({
        targets: this.player,
        x: targetX,
        y: targetY,
        duration: this.moveSpeed,
        ease: 'Linear',
        onComplete: () => {
          this.playerX = newX;
          this.playerY = newY;
          this.direction = newDirection;
          this.updateVisibility();
          this.isMoving = false;
        }
      });
    }
  }

  updatePlayerPosition(x: number, y: number) {
    this.playerX = x;
    this.playerY = y;
    if (this.player) {
      this.player.x = this.playerX * this.tileSize + this.tileSize / 2;
      this.player.y = this.playerY * this.tileSize + this.tileSize / 2;
    }
    this.updateVisibility();
  }

  private computeVisibleTiles(): {x: number, y: number}[] {
    const visibles: {x: number, y: number}[] = [];
    const px = this.playerX;
    const py = this.playerY;
    const dirAngles: Record<string, number> = {
      'left': Math.PI,
      'right': 0,
      'up': 3 * Math.PI / 2,
      'down': Math.PI / 2,
    };
    const dirAngle = dirAngles[this.direction];
    const halfAngleRad = (this.coneAngle / 2) * (Math.PI / 180);

    for (let dy = -this.range; dy <= this.range; dy++) {
      for (let dx = -this.range; dx <= this.range; dx++) {
        const nx = px + dx;
        const ny = py + dy;
        if (nx < 0 || nx >= this.grid[0].length || ny < 0 || ny >= this.grid.length) continue;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > this.range || dist === 0) continue;
        let angle = Math.atan2(dy, dx);
        if (angle < 0) angle += 2 * Math.PI;
        let delta = Math.abs(angle - dirAngle);
        if (delta > Math.PI) delta = 2 * Math.PI - delta;
        if (delta <= halfAngleRad) {
          visibles.push({x: nx, y: ny});
        }
      }
    }
    // Always include player position
    visibles.push({x: px, y: py});
    return visibles;
  }

  private updateVisibility() {
    if (!this.light || !this.fog) return;
    const light = this.light;
    const visibles = this.computeVisibleTiles();
    light.clear();
    light.fillStyle(0xffffff, 1);
    visibles.forEach(v => {
      light.fillRect(v.x * this.tileSize, v.y * this.tileSize, this.tileSize, this.tileSize);
    });
  }

  update() {
    // No continuous update needed for discrete movement
  }
}

const PhaserGame = ({ gameState, room }: Props) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    let game: any = null;

    const config = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 672, // 21*32
      height: 672,
      scene: [MazeScene],
      backgroundColor: '#000000',
    };

    game = new Phaser.Game(config);

    // Start scene with maze data
    game.scene.start('MazeScene', {
      grid: gameState?.grid,
      roundState: gameState?.roundState || 'waiting',
      playerX: gameState?.players?.get(gameState?.sessionId)?.x || 1,
      playerY: gameState?.players?.get(gameState?.sessionId)?.y || 1,
    });

    // Store scene reference
    sceneRef.current = game.scene.getScene('MazeScene');

    return () => {
      if (game) {
        game.destroy(true);
      }
    };
  }, [gameState]);

  useEffect(() => {
    if (!room || !sceneRef.current) return;

    const handleStateChange = (changes: any[]) => {
      changes.forEach(change => {
        if (change.field === 'players') {
          const player = room.state.players.get(gameState.sessionId);
          if (player && sceneRef.current) {
            sceneRef.current.updatePlayerPosition(player.x, player.y);
          }
        }
      });
    };

    room.state.onChange = handleStateChange;

    return () => {
      room.state.onChange = null;
    };
  }, [room, gameState.sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Defer server sync to 3.2; local movement handled in Phaser scene
    // For accessibility fallback, but primary input is Phaser keyboard
  };

  return (
    <div
      ref={gameRef}
      data-testid="phaser-game"
      tabIndex={0}
      aria-label="Maze game canvas - use arrow keys or WASD to move"
      className="w-full h-[672px] outline-none focus:outline-none"
      onKeyDown={handleKeyDown}
      role="application"
    />
  );
};

export default PhaserGame;