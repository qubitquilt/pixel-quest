'use client';

import { useRouter } from "next/navigation";
import { Client } from "colyseus";

export function HostGameButton() {
  const router = useRouter();

  const handleHostGame = async () => {
    try {
      const client: Client = new Client;
      const room = await client.create("maze_race");
      router.push(`/lobby/${room.id}`);
    } catch (e) {
      console.error("Failed to create room", e);
      // Here we would show an error toast
    }
  };

  return <button onClick={handleHostGame}>Host Game</button>;
}
