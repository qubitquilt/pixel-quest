'use client';

import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { Room } from 'colyseus.js';
import { GameState } from '@/shared/types';
import { client } from '@/lib/colyseus';
import dynamic from 'next/dynamic';

const PhaserGame = dynamic(() => import('@/app/components/PhaserGame'), { ssr: false });

const GamePage = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [room, setRoom] = useState<Room<GameState> | null>(null);
  const [joined, setJoined] = useState(false);
  const [localSessionId, setLocalSessionId] = useState<string>('');

  const joinGame = useCallback(async () => {
    if (!roomId || joined) return;
    try {
      let joinedRoom: Room<GameState>;
      if ((window as any).room && (window as any).room.roomId === roomId) {
        joinedRoom = (window as any).room as Room<GameState>;
        console.log('Using existing room from window');
      } else {
        const newRoom = await client.joinById(roomId as string);
        joinedRoom = newRoom as Room<GameState>;
        console.log('Joined new room, initial state roundState:', joinedRoom.state.roundState, 'grid length:', joinedRoom.state.grid?.length || 0);
      }
      setRoom(joinedRoom);
      const localSessionId = joinedRoom.sessionId;
      console.log('Game page initial clone roundState:', joinedRoom.state.roundState, 'grid length:', joinedRoom.state.grid?.length || 0);
      setGameState(joinedRoom.state.clone());
      joinedRoom.onStateChange((state) => {
        console.log('Game page state change:', state.roundState, 'grid length:', state.grid?.length || 0);
        if (state.roundState === 'playing') {
          console.log('Game page detected playing state from onStateChange');
        }
        setGameState(state.clone());
      });

      // Force refresh gameState after delay to catch sync
      setTimeout(() => {
        console.log('Game page forcing refresh gameState roundState:', joinedRoom.state.roundState, 'grid length:', joinedRoom.state.grid?.length || 0);
        setGameState(joinedRoom.state.clone());
      }, 500);
      setJoined(true);
    } catch (err) {
      console.error('Failed to join game room', err);
    }
  }, [roomId, joined]);

  useEffect(() => {
    joinGame();
  }, [joinGame]);

  useEffect(() => {
    return () => {
      if (joined) room?.leave();
    };
  }, [room, joined]);

  if (!gameState || gameState.roundState !== 'playing') {
    return <div>Loading game...</div>;
  }

  return (
    <div className="p-4">
      <h1>Game: {roomId}</h1>
      <PhaserGame room={room} sessionId={localSessionId} />
      <p className="mt-2 text-sm text-gray-500">Debug: roundState = {gameState.roundState}, grid length = {gameState.grid?.length || 0}</p>
    </div>
  );
};

export default GamePage;