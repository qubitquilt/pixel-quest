'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Room } from 'colyseus.js';
import { GameState } from '@/shared/types';
import { client } from '@/lib/colyseus';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const PhaserGame = dynamic(() => import('@/app/components/PhaserGame'), { ssr: false });

const LobbyPage = () => {
  const router = useRouter();
  const { roomId, host: hostQuery } = router.query;
  const isHost = String(hostQuery) === 'true';
  const [room, setRoom] = useState<Room<GameState> | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareableUrl, setShareableUrl] = useState('');

  useEffect(() => {
    if (roomId && typeof window !== 'undefined') {
      setShareableUrl(`${window.location.origin}/lobby/${roomId}`);
    }
  }, [roomId]);

  const handleCopy = async () => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(shareableUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
        fallbackCopy();
      }
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    const textArea = document.createElement('textarea');
    textArea.value = shareableUrl;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Fallback copy failed: ', err);
    }
    document.body.removeChild(textArea);
  };

  const handleJoin = async () => {
    if (!roomId || joined) return;
  
    console.log('Attempting to join room with name:', playerName.trim() || 'Player');
    try {
      const name = playerName.trim() || 'Player';
      const joinedRoom = await client.joinById(roomId as string, { name });
      console.log('Successfully joined room:', joinedRoom.roomId);
      const typedRoom = joinedRoom as Room<GameState>;
      setRoom(typedRoom);
      setGameState(typedRoom.state.clone());
      (window as any).room = typedRoom;
      typedRoom.onStateChange((state) => {
        console.log('State changed, players:', Array.from(state.players.values()).map(p => p.name));
        setGameState(state.clone());
      });
      
      typedRoom.onMessage('gameStarted', () => {
        console.log('Game started, navigating to game page');
        router.push(`/game/${roomId}`);
      });
      
      setJoined(true);
    } catch (err) {
      console.error("Failed to join room", err);
      // No redirect for E2E testing; keep lobby visible for UI validation
    }
  };
  
  useEffect(() => {
    if (roomId && typeof window !== 'undefined') {
      setShareableUrl(`${window.location.origin}/lobby/${roomId}`);
      
      // Auto-join for host
      if (isHost && (window as any).room && (window as any).room.roomId === roomId) {
        const hostRoom = (window as any).room as Room<GameState>;
        setRoom(hostRoom);
        setGameState(hostRoom.state.clone());
        setJoined(true);
        hostRoom.onStateChange((state) => {
          console.log('State changed, players:', Array.from(state.players.values()).map(p => p.name));
          setGameState(state.clone());
        });
        
        hostRoom.onMessage('gameStarted', () => {
          console.log('Game started, navigating to game page');
          router.push(`/game/${roomId}`);
        });
        
        console.log('Auto-joined as host using global room');
        // Set initial gameState from host room
        if (hostRoom.state) {
          setGameState(hostRoom.state);
        }
      }
    }

    return () => {
      console.log('LobbyPage useEffect cleanup: calling room.leave()');
      if (!isHost) room?.leave();
    };
  }, [roomId, room, router]);

  const joinForm = (
    <div className="max-w-md mx-auto mt-8 p-6 border rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Join Lobby: {roomId}</h1>
      <div className="mb-4">
        <label htmlFor="player-name" className="block text-sm font-medium mb-2">Enter your name:</label>
        <Input
          id="player-name"
          data-testid="player-name-input"
          value={playerName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlayerName(e.target.value)}
          placeholder="Your name"
          className="w-full"
        />
      </div>
      <Button onClick={handleJoin} disabled={false} data-testid="join-button">
        Join Game
      </Button>
    </div>
  );
  
  const handleStartGame = async () => {
    if (!room) return;
    try {
      await room.send('startGame');
      console.log('Start game message sent');
    } catch (error) {
      console.error('Failed to send start game message:', error);
    }
  };
  
  const lobbyContent = (
    <div>
      <h1>Lobby: {roomId}</h1>
      <div className="mt-4">
        <label htmlFor="shareable-url" className="block text-sm font-medium mb-2">Shareable URL:</label>
        <div className="flex gap-2">
          <Input id="shareable-url" data-testid="shareable-url" value={shareableUrl} readOnly className="flex-1" />
          <Button onClick={handleCopy} disabled={copied} data-testid="copy-button">
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>
      </div>
      {gameState ? (
        <>
          <h2 className="mt-6">Players:</h2>
          <ul>
            {gameState?.players ? Array.from(gameState.players.values()).map(player => (
              <li key={player.id}>{player.name}</li>
            )) : <li>No players</li>}
          </ul>
          {isHost && (
            <div className="mt-4">
              <Button
                onClick={handleStartGame}
                disabled={(gameState.players?.size ?? 0) < 2}
                data-testid="start-game-button"
                className="w-full"
              >
                Start Game
              </Button>
            </div>
          )}
          {gameState.roundState === 'playing' && (
            <div className="mt-4">
              <PhaserGame gameState={gameState} />
            </div>
          )}
        </>
      ) : (
        <div>Loading players...</div>
      )}
    </div>
  );
  
  if (!roomId) {
    return <div>Invalid room ID</div>;
  }
  
  return joined ? lobbyContent : joinForm;
};

export default LobbyPage;
