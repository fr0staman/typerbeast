import { kyClient } from "@/app/hooks/fetchWithAuth";
import { useMutation } from "@tanstack/react-query";

type CreateRoomResponse = {
  room_id: string;
};
async function createRoom(dict_id?: string): Promise<CreateRoomResponse> {
  return await kyClient
    .post("rooms", {
      json: { dictionary_id: dict_id },
    })
    .json();
}

export const useRoomCreate = () =>
  useMutation({
    mutationFn: createRoom,
    onError: (err: string) => {
      console.error("Failed to create room", err);
    },
  });
