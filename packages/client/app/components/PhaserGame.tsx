'use client';

import { useEffect, useRef } from 'react';

import * as Phaser from 'phaser';
import { Player } from 'shared/types';

interface Props {
  gameState: any;
  room?: any; // Colyseus room for sending movement
  sessionId?: string;
}

interface OtherPlayer {
  x: number;
  y: number;
  direction: string;
}

class MazeScene extends Phaser.Scene {
  grid: number[][] = [];
  player: Phaser.GameObjects.Rectangle | null = null;
  otherPlayerSprites = new Map<string, Phaser.GameObjects.Rectangle>();
  tilesGroup: Phaser.GameObjects.Group | null = null;
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
  visualCones: Phaser.GameObjects.Graphics | null = null;
  isMoving = false;
  sessionId: string = '';
  room: any = null;
  otherPlayers = new Map<string, OtherPlayer>();
  visibleCache = new Map<string, {x: number, y: number}[]>();

  constructor() {
    super({ key: 'MazeScene' });
  }

  init(data: any) {
    try {
      this.sessionId = data.sessionId || '';
      this.room = data.room;
      this.otherPlayers = new Map();
      this.visibleCache.clear();
    } catch (error) {
      console.error('MazeScene init error:', error);
    }
  }

  preload() {
    // Preload assets if any
  }

  create() {
    // Initial setup without grid; full render deferred to updateGameState
    try {
      // Add player sprite at starting position (placeholder)
      if (!this.player) {
        this.player = this.add.rectangle(
          this.tileSize + this.tileSize / 2,
          this.tileSize + this.tileSize / 2,
          28,
          28,
          0x0000ff
        );
        this.player.setOrigin(0.5);
      }

      // Setup keyboard input for local movement
      (this.input.keyboard as any)?.on('keydown', this.handleKeyDown, this);
    } catch (error) {
      console.error('MazeScene create error:', error);
    }
  }

  updateGameState(data: any) {
    try {
      if (!data) return;

      const newGrid = data.grid || [];
      const gridChanged = !arraysEqual(this.grid.flat(), newGrid);

      // Reshape flat grid to 2D if it's a flat array (from Colyseus serialization)
      if (Array.isArray(newGrid) && newGrid.length === 441) {
        const width = 21;
        this.grid = Array.from({ length: width }, (_, y) =>
          Array.from({ length: width }, (_, x) => newGrid[y * width + x])
        );
      } else {
        this.grid = newGrid.length ? newGrid : this.grid;
      }

      this.roundState = data.roundState || this.roundState;
      this.playerX = data.players?.get(this.sessionId)?.x || this.playerX || 1;
      this.playerY = data.players?.get(this.sessionId)?.y || this.playerY || 1;
      this.direction = data.players?.get(this.sessionId)?.direction || this.direction || 'down';

      if (gridChanged) {
        this.visibleCache.clear(); // Invalidate cache on grid change

        // Destroy old tiles group
        if (this.tilesGroup) {
          this.tilesGroup.destroy(true, true);
          this.tilesGroup = null;
        }

        // Re-render maze if grid ready
        if (this.grid && this.grid.length > 0) {
          this.tilesGroup = this.add.group();
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
              this.tilesGroup.add(tile);
            }
          }
        }
      }

      // Recreate player if not exists or reposition
      if (!this.player) {
        this.player = this.add.rectangle(
          this.playerX * this.tileSize + this.tileSize / 2,
          this.playerY * this.tileSize + this.tileSize / 2,
          28,
          28,
          0x0000ff
        );
        this.player.setOrigin(0.5);
      } else {
        this.player.x = this.playerX * this.tileSize + this.tileSize / 2;
        this.player.y = this.playerY * this.tileSize + this.tileSize / 2;
      }

      // Recreate overlays if needed
      if (!this.fog) {
        this.fog = this.add.graphics().setDepth(1);
        this.fog.fillStyle(0x000000, 1);
        this.fog.fillRect(0, 0, this.scale.width, this.scale.height);
      }
      if (!this.light) {
        this.light = this.add.graphics().setDepth(2);
      }
      if (!this.visualCones) {
        this.visualCones = this.add.graphics().setDepth(3);
      }

      // Update visibility if grid ready
      if (this.grid.length > 0) {
        this.updateVisibility();
      }

      // Update other players from data if provided
      if (data.players) {
        data.players.forEach((player: Player, id: string) => {
          if (id !== this.sessionId) {
            this.otherPlayers.set(id, { x: player.x, y: player.y, direction: player.direction || 'down' });
            this.updatePlayer(id, player.x, player.y, player.direction || 'down');
          }
        });
      }
    } catch (error) {
      console.error('MazeScene updateGameState error:', error);
    }
  }

  private arraysEqual(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
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

    const oldX = this.playerX;
    const oldY = this.playerY;

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
          if (this.room) {
            this.room.send('move', {
              dx: newX - oldX,
              dy: newY - oldY,
              direction: newDirection
            });
          }
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

  updatePlayer(id: string, x: number, y: number, direction: string) {
    try {
      if (id === this.sessionId) {
        // Update self
        this.playerX = x;
        this.playerY = y;
        this.direction = direction;
        this.updatePlayerPosition(x, y);
      } else {
        // Update other player state
        this.otherPlayers.set(id, { x, y, direction });

        // Destroy old sprite if exists
        const oldSprite = this.otherPlayerSprites.get(id);
        if (oldSprite) {
          oldSprite.destroy();
        }

        // Create new sprite
        const sprite = this.add.rectangle(
          x * this.tileSize + this.tileSize / 2,
          y * this.tileSize + this.tileSize / 2,
          28,
          28,
          0x00ff00 // Green for other players
        );
        sprite.setOrigin(0.5);
        this.otherPlayerSprites.set(id, sprite);

        this.updateVisibility();
      }
    } catch (error) {
      console.error(`MazeScene updatePlayer error for ${id}:`, error);
    }
  }

  private computeVisibleTilesFor(px: number, py: number, dir: string): {x: number, y: number}[] {
    const cacheKey = `${px}-${py}-${dir}`;
    if (this.visibleCache.has(cacheKey)) {
      return this.visibleCache.get(cacheKey)!;
    }

    const visibles: {x: number, y: number}[] = [];
    const dirAngles: Record<string, number> = {
      'left': Math.PI,
      'right': 0,
      'up': 3 * Math.PI / 2,
      'down': Math.PI / 2,
    };
    const dirAngle = dirAngles[dir] || dirAngles['down'];
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
    this.visibleCache.set(cacheKey, visibles);
    return visibles;
  }

  private updateVisibility() {
    if (!this.light || !this.fog || this.grid.length === 0) return;
    try {
      const light = this.light;
      const seen = new Set<string>();
      const allVisibles: {x: number, y: number}[] = [];
      const addVisible = (v: {x: number, y: number}) => {
        const key = `${v.x},${v.y}`;
        if (!seen.has(key)) {
          seen.add(key);
          allVisibles.push(v);
        }
      };

      // Own cone
      const ownVis = this.computeVisibleTilesFor(this.playerX, this.playerY, this.direction);
      ownVis.forEach(addVisible);

      // Other players' cones
      this.otherPlayers.forEach((other: OtherPlayer) => {
        const otherVis = this.computeVisibleTilesFor(other.x, other.y, other.direction);
        otherVis.forEach(addVisible);
      });

      light.clear();
      light.fillStyle(0xffffff, 1);
      allVisibles.forEach(v => {
        light.fillRect(v.x * this.tileSize, v.y * this.tileSize, this.tileSize, this.tileSize);
      });

      // Visual diff for cones
      if (this.visualCones) {
        const visualCones = this.visualCones;
        visualCones.clear();

        // Own cone full brightness tint
        visualCones.fillStyle(0xffffff, 0.3);
        ownVis.forEach(v => {
          visualCones.fillRect(v.x * this.tileSize, v.y * this.tileSize, this.tileSize, this.tileSize);
        });

        // Other players' cones semi-transparent tint
        this.otherPlayers.forEach((other: OtherPlayer) => {
          const otherVis = this.computeVisibleTilesFor(other.x, other.y, other.direction);
          visualCones.fillStyle(0xaaaaaa, 0.3);
          otherVis.forEach(v => {
            visualCones.fillRect(v.x * this.tileSize, v.y * this.tileSize, this.tileSize, this.tileSize);
          });
        });
      }
    } catch (error) {
      console.error('MazeScene updateVisibility error:', error);
    }
  }

  update() {
    // No continuous update needed for discrete movement
  }
}

const PhaserGame = ({ gameState, room, sessionId = '' }: Props) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const gameInstanceRef = useRef<any>(null);

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

    // Start scene with initial empty data
    game.scene.start('MazeScene', {
      grid: [],
      roundState: 'waiting',
      playerX: 1,
      playerY: 1,
      sessionId: sessionId,
      room: room,
    });

    // Store references
    gameInstanceRef.current = game;
    sceneRef.current = game.scene.getScene('MazeScene');

    return () => {
      if (game) {
        game.destroy(true);
      }
    };
  }, []); // Mount once

  useEffect(() => {
    if (!sceneRef.current || !gameState) return;

    // Update scene with current gameState
    sceneRef.current.updateGameState({
      grid: gameState.grid,
      roundState: gameState.roundState || 'waiting',
      players: gameState.players,
      sessionId,
      room,
    });
  }, [gameState, sessionId, room]);

  useEffect(() => {
    if (!room || !sceneRef.current) return;

    const handleStateChange = (changes: any[]) => {
      // Process changes more efficiently - only update affected players
      changes.forEach(change => {
        if (change.field === 'players' && change.value) {
          const playerId = change.path?.[1]; // From MapSchema path
          if (playerId) {
            const player = room.state.players.get(playerId);
            if (player) {
              sceneRef.current.updatePlayer(playerId, player.x, player.y, player.direction || 'down');
            }
          } else {
            // Fallback full update if path not available
            room.state.players.forEach((player: Player, id: string) => {
              sceneRef.current.updatePlayer(id, player.x, player.y, player.direction || 'down');
            });
          }
        }
      });
    };

    room.state.onChange = handleStateChange;

    // Initial players update
    room.state.players.forEach((player: Player, id: string) => {
      sceneRef.current.updatePlayer(id, player.x, player.y, player.direction || 'down');
    });

    return () => {
      room.state.onChange = null;
    };
  }, [room]);

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