import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Room } from 'colyseus.js';
import { GameState } from '../../../../packages/shared/types';
import { client } from '@/lib/colyseus';

const LobbyPage = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const [room, setRoom] = useState<Room<GameState> | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    if (roomId) {
      client.joinById(roomId as string).then(room => {
        setRoom(room);
        room.onStateChange(setGameState);
      }).catch(err => {
        console.error("Failed to join room", err);
        router.push('/'); // Redirect to home on failure
      });
    }

    return () => {
      room?.leave();
    };
  }, [roomId, room, router]);

  if (!gameState) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Lobby: {room?.id}</h1>
      <h2>Players:</h2>
      <ul>
        {Array.from(gameState.players.values()).map(player => (
          <li key={player.id}>{player.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default LobbyPage;
