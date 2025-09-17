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
        console.log('Joined new room');
      }
      setRoom(joinedRoom);
      const localSessionId = joinedRoom.sessionId;
      setGameState(joinedRoom.state.clone());
      joinedRoom.onStateChange((state) => {
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
      <PhaserGame gameState={gameState} room={room} sessionId={localSessionId} />
    </div>
  );
};

export default GamePage;