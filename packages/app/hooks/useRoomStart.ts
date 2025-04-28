import { fetchWithAuth } from "@/app/hooks/fetchWithAuth";
import { useMutation } from "@tanstack/react-query";
import { PUBLIC_API_URL } from "@/app/store/config";

async function startRoom(room_id: string): Promise<void> {
  const res = await fetchWithAuth(PUBLIC_API_URL + `/rooms/${room_id}/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error("Failed to start room");
  }
}

export const useRoomStart = () =>
  useMutation({
    mutationFn: startRoom,
    onError: (err: string) => {
      console.error("Failed to start room", err);
    },
  });
