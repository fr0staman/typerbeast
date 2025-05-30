import { fetchWithAuth } from "@/app/hooks/fetchWithAuth";
import { useMutation } from "@tanstack/react-query";
import { PUBLIC_API_URL } from "@/app/store/config";

async function createRoom(text_id: string): Promise<string> {
  const res = await fetchWithAuth(PUBLIC_API_URL + "/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text_id }),
  });
  if (!res.ok) {
    throw new Error("Failed to create room");
  }
  const data = await res.json();
  return data.room_id; // assuming { room_id: "..." }
}

export const useRoomCreate = () =>
  useMutation({
    mutationFn: createRoom,
    onError: (err: string) => {
      console.error("Failed to create room", err);
    },
  });
