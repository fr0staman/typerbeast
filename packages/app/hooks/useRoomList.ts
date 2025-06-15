import { useQuery } from "@tanstack/react-query";
import { kyClient } from "@/app/hooks/fetchWithAuth";

type RoomStats = {
  room_id: string;
  players: number;
  started: boolean;
};

type RoomResponse = {
  rooms: RoomStats[];
};

async function fetchRooms(): Promise<RoomResponse> {
  return await kyClient.get("rooms").json();
}

export const useRoomList = () =>
  useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
    refetchInterval: 3000, // refresh every 3 seconds
  });
