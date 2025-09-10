'use client';

import { useRouter } from "next/navigation";
import { client } from "@/lib/colyseus";
import { Button } from "../../components/ui/button";

export function HostGameButton() {
  const router = useRouter();

  const handleHostGame = async () => {
    console.log('HostGameButton click handler called');
    try {
      console.log('Starting room creation...');
      const room = await client.create("maze_race", { name: 'Player' });
      console.log('Room created successfully:', room.roomId);
      (window as any).room = room;
      console.log('Navigating to lobby:', `/lobby/${room.roomId}?host=true`);
      router.push(`/lobby/${room.roomId}?host=true`);
    } catch (e) {
      console.error("Failed to create room", e);
      // Here we would show an error toast
    }
  };

  return <Button onClick={handleHostGame}>
    Host Game
  </Button>;
}
