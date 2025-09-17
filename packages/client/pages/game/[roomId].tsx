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

  const joinGame = useCallback(async () => {
    if (!roomId || joined) return;
    try {
      const joinedRoom = await client.joinById(roomId as string);
      const typedRoom = joinedRoom as Room<GameState>;
      setRoom(typedRoom);
      setGameState(typedRoom.state.clone());
      typedRoom.onStateChange((state) => {
        setGameState(state.clone());
      });
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

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  return (
    <div className="p-4">
      <h1>Game: {roomId}</h1>
      <PhaserGame gameState={gameState} />
    </div>
  );
};

export default GamePage;