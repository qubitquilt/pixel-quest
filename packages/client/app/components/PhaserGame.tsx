'use client';

import { useEffect, useRef } from 'react';

import * as Phaser from 'phaser';
import { Player } from 'shared/types';

interface Props {
  room: any; // Colyseus room for state and sending movement
  sessionId: string;
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
  tilesGroup: Phaser.GameObjects.Graphics[] = [];
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
  // Pending sync tracking for server rejection
  pendingExpectedX: number = 0;
  pendingExpectedY: number = 0;
  pendingOldX: number = 0;
  pendingOldY: number = 0;
  isPendingSync = false;
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
      console.log('MazeScene: Setting up keyboard input');
      if (this.input.keyboard) {
        (this.input.keyboard as any).on('keydown', this.handleKeyDown, this);
        console.log('Keyboard input enabled successfully');
      } else {
        console.error('Keyboard input not available');
      }
    } catch (error) {
      console.error('MazeScene create error:', error);
    }
  }

  updateGameState(data: any) {
    try {
      console.log('updateGameState received:', { roundState: data.roundState, gridLength: data.grid?.length || 0 });
      console.log('MazeScene updateGameState called with data:', data);
      if (!data) return;

      const newGrid = data.grid || [];
      const gridChanged = !this.arraysEqual(this.grid.flat(), newGrid);

      // Reshape flat grid to 2D if it's a flat array (from Colyseus serialization)
      if (Array.isArray(newGrid) && newGrid.length === 441) {
        const width = 21;
        this.grid = Array.from({ length: width }, (_, y) =>
          Array.from({ length: width }, (_, x) => newGrid[y * width + x])
        );
      } else {
        this.grid = newGrid.length ? newGrid : this.grid;
      }

      this.roundState = data.roundState ?? this.roundState;
      console.log('MazeScene: Updated roundState to', this.roundState, 'Grid length:', this.grid.length);
      this.playerX = data.players?.get(this.sessionId)?.x || this.playerX || 1;
      this.playerY = data.players?.get(this.sessionId)?.y || this.playerY || 1;
      this.direction = data.players?.get(this.sessionId)?.direction || this.direction || 'down';
  
      // Handle server rejection: Check if pending move was rejected
      if (this.isPendingSync) {
        const serverX = data.players?.get(this.sessionId)?.x || this.playerX;
        const serverY = data.players?.get(this.sessionId)?.y || this.playerY;
        if (serverX !== this.pendingExpectedX || serverY !== this.pendingExpectedY) {
          console.log('Move rejected by server, reverting to old position:', this.pendingOldX, this.pendingOldY);
          // Revert local position
          this.playerX = this.pendingOldX;
          this.playerY = this.pendingOldY;
          if (this.player) {
            const oldPosX = this.pendingOldX * this.tileSize + this.tileSize / 2;
            const oldPosY = this.pendingOldY * this.tileSize + this.tileSize / 2;
            // Tween back to old position
            (this as any).tweens.add({
              targets: this.player,
              x: oldPosX,
              y: oldPosY,
              duration: this.moveSpeed / 2,
              ease: 'Linear',
              onComplete: () => {
                this.shakeEffect();
              }
            });
          }
          this.isPendingSync = false;
        } else {
          // Accepted, reset flags
          this.isPendingSync = false;
        }
      }
  
      if (gridChanged) {
        this.visibleCache.clear(); // Invalidate cache on grid change
  
        // Destroy old tiles group
        if (this.tilesGroup) {
          this.tilesGroup.forEach((tile: Phaser.GameObjects.Graphics) => (tile as any).destroy(true));
          this.tilesGroup = [];
        }
  
        // Re-render maze if grid ready
        if (this.grid && this.grid.length > 0) {
          this.tilesGroup = (this.add as any).group();
          console.log('MazeScene: Created tilesGroup with', this.grid.length * this.grid[0].length, 'tiles');
          for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
              const tile = this.add.graphics();
              const value = this.grid[y][x];
              if (value === 0) {
                // Wall - gray for debugging visibility
                tile.fillStyle(0x888888, 1);
              } else {
                // Path
                tile.fillStyle(0xffffff, 1);
              }
              tile.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
              this.tilesGroup.push(tile);
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
          this.updateVisibility();
          this.isMoving = false;
          if (this.room) {
            console.log('Sending move to server:', { dx: newX - oldX, dy: newY - oldY, direction: newDirection });
            this.room.send('move', {
              dx: newX - oldX,
              dy: newY - oldY,
              direction: newDirection
            });
          }
        }
      });
    } else {
      console.log('Invalid move: out of bounds or wall');
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
        // Update other player state and sprite with tween for smooth movement
        this.otherPlayers.set(id, { x, y, direction });

        let sprite = this.otherPlayerSprites.get(id);
        const targetX = x * this.tileSize + this.tileSize / 2;
        const targetY = y * this.tileSize + this.tileSize / 2;

        if (!sprite) {
          // New player join: create sprite
          console.log('Created new sprite for player', id);
          sprite = this.add.rectangle(
            targetX,
            targetY,
            28,
            28,
            0x00ff00 // Green for other players
          );
          sprite.setOrigin(0.5);
          this.otherPlayerSprites.set(id, sprite);
        } else {
          // Existing player: tween to new position
          console.log('Tweening sprite for player', id, 'to', x, y);
          (this as any).tweens.add({
            targets: sprite,
            x: targetX,
            y: targetY,
            duration: this.moveSpeed,
            ease: 'Linear'
          });
        }

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

  private shakeEffect() {
    if (!this.player) return;
    // Simple horizontal shake feedback for rejection
    (this as any).tweens.add({
      targets: this.player,
      x: '+=10',
      duration: 50,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        // Ensure final position after shake
        this.player!.x = this.playerX * this.tileSize + this.tileSize / 2;
      }
    });
    console.log('Shake effect triggered for move rejection');
  }

  update() {
    // No continuous update needed for discrete movement
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
        width: 672, // 21*32
        height: 672,
        scene: [MazeScene],
        backgroundColor: '#000000',
      };

      game = new Phaser.Game(config);

      // Start scene with initial data from room
      game.scene.start('MazeScene', {
        sessionId,
        room,
      });

      // Store references
      gameInstanceRef.current = game;
      sceneRef.current = game.scene.getScene('MazeScene');
    } catch (error) {
      console.error('PhaserGame init error:', error);
    }

    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
      }
    };
  }, [room]); // Depend on room to recreate if needed

  // Removed old gameState useEffect; handled in room useEffect below

  useEffect(() => {
    try {
      if (!room || !sceneRef.current) return;

      // Initial full update
      console.log('PhaserGame room useEffect: Initial update with roundState:', room.state.roundState, 'grid length:', room.state.grid?.length || 0);
      sceneRef.current.updateGameState({
        grid: room.state.grid,
        roundState: room.state.roundState || 'waiting',
        players: room.state.players,
        sessionId,
        room,
      });

      // Force refresh after short delay to catch any pending state sync
      setTimeout(() => {
        console.log('PhaserGame forcing refresh update with roundState:', room.state.roundState, 'grid length:', room.state.grid?.length || 0);
        sceneRef.current.updateGameState({
          grid: room.state.grid,
          roundState: room.state.roundState || 'waiting',
          players: room.state.players,
          sessionId,
          room,
        });
      }, 300);

      const handleStateChange = (changes: any[]) => {
        console.log('PhaserGame room onChange: Changes detected, updating with roundState:', room.state.roundState);
        sceneRef.current.updateGameState({
          grid: room.state.grid,
          roundState: room.state.roundState || 'waiting',
          players: room.state.players,
          sessionId,
          room,
        });
      };

      room.state.onChange = handleStateChange;

      return () => {
        room.state.onChange = null;
      };
    } catch (error) {
      console.error('PhaserGame room useEffect error:', error);
    }
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