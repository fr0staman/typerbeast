import { useQuery } from "@tanstack/react-query";
import { PUBLIC_API_URL } from "@/app/store/config";
import { fetchWithAuth } from "@/app/hooks/fetchWithAuth";

type RoomStats = {
  room_id: string;
  players: number;
  started: boolean;
};

async function fetchRooms(): Promise<RoomStats[]> {
  const res = await fetchWithAuth(PUBLIC_API_URL + "/rooms");
  if (!res.ok) {
    throw new Error("Failed to fetch rooms");
  }
  const data = await res.json();
  return data.rooms; // assuming { rooms: [...] }
}

export const useRoomList = () =>
  useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
    refetchInterval: 3000, // refresh every 3 seconds
  });
