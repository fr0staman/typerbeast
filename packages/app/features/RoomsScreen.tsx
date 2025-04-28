"use client";

import { Button, VStack, ButtonText } from "@/ui/components";
import { FlatList } from "react-native";
import { useRouter } from "solito/navigation";
import { useRoomList } from "@/app/hooks/useRoomList";
import { useRoomCreate } from "@/app/hooks/useRoomCreate";
import { fetchWithAuth } from "@/app/hooks/fetchWithAuth";
import { PUBLIC_API_URL } from "@/app/store/config";
import { useAppTranslation } from "@/app/i18n/hooks";

export const RoomsScreen = () => {
  const { t } = useAppTranslation("rooms");

  const router = useRouter();

  const { data: rooms = [] } = useRoomList();
  const { mutateAsync: createRoomAsync } = useRoomCreate();

  const createRoom = async () => {
    // TODO: add create room logic
    const text_id = "36a781f8-fad5-4941-9a88-4310c7b4fc31";
    const room_id = await createRoomAsync(text_id);

    router.push(`/rooms/${room_id}`);
  };

  const joinRoom = async (roomId: string) => {
    try {
      await fetchWithAuth(PUBLIC_API_URL + `/rooms/${roomId}/join`, {
        method: "POST",
      });
      router.push(`/rooms/${roomId}`);
    } catch (err) {
      console.error("Failed to join room", err);
    }
  };

  return (
    <VStack className="flex-1 p-4 bg-background space-y-4">
      <Button onPress={createRoom} className="bg-primary rounded-xl p-4">
        <ButtonText className="text-white font-bold text-center">
          {t("createRoom")}
        </ButtonText>
      </Button>

      <FlatList
        data={rooms}
        keyExtractor={item => item.room_id}
        renderItem={({ item }) => (
          <Button
            onPress={() => joinRoom(item.room_id)}
            className="w-full bg-secondary rounded-lg p-4 mb-2"
          >
            <ButtonText className="text-white text-lg">
              {t(item.started ? "roomDetailsStarted" : "roomDetails", {
                room_id: item.room_id.slice(0, 8),
                players: item.players,
              })}
            </ButtonText>
          </Button>
        )}
      />
    </VStack>
  );
};
