import { kyClient } from "@/app/hooks/fetchWithAuth";
import { useMutation } from "@tanstack/react-query";

async function startRoom(room_id: string): Promise<void> {
  return await kyClient.post(`rooms/${room_id}/start`).json();
}

export const useRoomStart = () =>
  useMutation({
    mutationFn: startRoom,
    onError: (err: string) => {
      console.error("Failed to start room", err);
    },
  });
