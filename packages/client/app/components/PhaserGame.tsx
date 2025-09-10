'use client';

import { useEffect, useRef } from 'react';

import type { GameObjects, Types } from 'phaser';

import * as Phaser from 'phaser';

interface Props {
  gameState: any;
  room?: any; // Colyseus room for sending movement
}

class MazeScene extends Phaser.Scene {
  grid: number[][] = [];
  player: Phaser.GameObjects.Rectangle | null = null;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  roundState: string = 'waiting';
  playerX = 0;
  playerY = 0;
  tileSize = 32;
  moveSpeed = 200; // ms per move

  constructor() {
    super({ key: 'MazeScene' });
  }

  init(data: any) {
    this.grid = data.grid || [];
    this.roundState = data.roundState || 'waiting';
    this.playerX = data.playerX || 1; // Start at (1,1) assuming open path
    this.playerY = data.playerY || 1;
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

    // Setup keyboard input
    this.cursors = this.input.keyboard?.createCursorKeys() ?? null;
  }

  updatePlayerPosition(x: number, y: number) {
    this.playerX = x;
    this.playerY = y;
    if (this.player) {
      this.player.x = this.playerX * this.tileSize + this.tileSize / 2;
      this.player.y = this.playerY * this.tileSize + this.tileSize / 2;
    }
  }

  update() {
    if (this.roundState !== 'playing' || !this.cursors || !this.player) return;

    const handleMovement = () => {
      if (this.cursors!.left.isDown) {
        const newX = this.playerX - 1;
        if (newX >= 0 && this.grid[this.playerY][newX] !== 0) {
          this.playerX = newX;
          this.player!.x = this.playerX * this.tileSize + this.tileSize / 2;
        }
      } else if (this.cursors!.right.isDown) {
        const newX = this.playerX + 1;
        if (newX < this.grid[0].length && this.grid[this.playerY][newX] !== 0) {
          this.playerX = newX;
          this.player!.x = this.playerX * this.tileSize + this.tileSize / 2;
        }
      } else if (this.cursors!.up.isDown) {
        const newY = this.playerY - 1;
        if (newY >= 0 && this.grid[newY][this.playerX] !== 0) {
          this.playerY = newY;
          this.player!.y = this.playerY * this.tileSize + this.tileSize / 2;
        }
      } else if (this.cursors!.down.isDown) {
        const newY = this.playerY + 1;
        if (newY < this.grid.length && this.grid[newY][this.playerX] !== 0) {
          this.playerY = newY;
          this.player!.y = this.playerY * this.tileSize + this.tileSize / 2;
        }
      }
    };

    handleMovement();
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
    if (!room) return;
    let dx = 0, dy = 0;
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        dx = -1;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        dx = 1;
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        dy = -1;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        dy = 1;
        break;
      default:
        return;
    }
    // Send movement delta to server
    room.send('move', { dx, dy });
    console.log('Key pressed:', e.key);
  };

  return (
    <div
      ref={gameRef}
      data-testid="phaser-game"
      tabIndex={0}
      aria-label="Maze game canvas"
      className="w-full h-[672px]"
      onKeyDown={handleKeyDown}
    />
  );
};

export default PhaserGame;