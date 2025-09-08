'use client';

import { useRouter } from "next/navigation";
import { client } from "@/lib/colyseus";

export function HostGameButton() {
  const router = useRouter();

  const handleHostGame = async () => {
    try {
      const room = await client.create("maze_race");
      router.push(`/lobby/${room.id}`);
    } catch (e) {
      console.error("Failed to create room", e);
      // Here we would show an error toast
    }
  };

  return <button onClick={handleHostGame}>Host Game</button>;
}
