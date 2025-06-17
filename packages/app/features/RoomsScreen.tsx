"use client";

import {
  Button,
  VStack,
  ButtonText,
  Heading,
  HStack,
  Box,
  Text,
  Link,
} from "@/ui/components";
import { FlatList, GestureResponderEvent } from "react-native";
import { useLink, useRouter } from "solito/navigation";
import { RoomStats, useRoomList } from "@/app/hooks/useRoomList";
import { useRoomCreate } from "@/app/hooks/useRoomCreate";
import { kyClient } from "@/app/hooks/fetchWithAuth";
import { useAppTranslation } from "@/app/i18n/hooks";

export const RoomsScreen = () => {
  const { t } = useAppTranslation("rooms");

  const router = useRouter();

  const { data: rooms = { rooms: [] } } = useRoomList();
  const { mutateAsync: createRoomAsync } = useRoomCreate();

  const createRoom = async () => {
    // TODO: add create room logic
    const { room_id } = await createRoomAsync(undefined);

    router.push(`/rooms/${room_id}`);
  };

  return (
    <VStack className="flex-1 text-gray-200 px-6 py-10">
      <VStack className="w-full md:max-w-7xl mx-auto space-y-8">
        <HStack className="flex items-center justify-between">
          <Heading as="h1" className="text-2xl font-bold">
            {t("availableRooms")}
          </Heading>
          <Button onPress={createRoom}>
            <ButtonText>{t("createRoom")}</ButtonText>
          </Button>
        </HStack>

        <FlatList
          data={rooms?.rooms}
          ListEmptyComponent={RoomsEmpty}
          renderItem={({ item }) => <RoomItem item={item} />}
        />
      </VStack>
    </VStack>
  );
};

type RoomItem = {
  item: RoomStats;
};

const RoomItem = ({ item }: RoomItem) => {
  const { t } = useAppTranslation(["rooms", "common"]);
  const toRoomLinkProps = useLink({
    href: `/rooms/${item.room_id}`,
  });

  const joinRoom = async (event?: GestureResponderEvent) => {
    try {
      await kyClient.post(`rooms/${item.room_id}/join`);
      toRoomLinkProps.onPress(event);
    } catch (err) {
      console.error("Failed to join room", err);
    }
  };

  return (
    <Link {...toRoomLinkProps} onPress={joinRoom}>
      <Box className="bg-gray-800 rounded-lg px-5 py-4 border border-gray-700 shadow-md flex items-center justify-between mb-4">
        <Box>
          <Text className="text-lg font-semibold">
            {t("room")}{" "}
            <Text className="text-blue-400">{item.room_id.slice(0, 8)}</Text>
          </Text>
          <Text className="text-sm text-gray-400">
            {t("dictionary")}:{" "}
            <Text className="text-gray-300">{item.dictionary.name}</Text>
          </Text>
        </Box>
        <Box>
          <Text>
            {t("players")}:{" "}
            <Text className="font-medium text-gray-300">{item.players}</Text>
          </Text>
          <Text>
            {t("status")}:{" "}
            <Text
              className={
                item.started
                  ? "text-red-400 font-semibold"
                  : "text-green-400 font-semibold"
              }
            >
              {item.started ? t("statusStarted") : t("statusWaiting")}
            </Text>
          </Text>
        </Box>
      </Box>
    </Link>
  );
};

const RoomsEmpty = () => {
  const { t } = useAppTranslation("rooms");
  return (
    <Box className="p-4 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900">
      <Text className="text-sm text-gray-500 dark:text-gray-400">
        {t("noRoomsFound")}
      </Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400">
        {t("youCanCreateOne")}
      </Text>
    </Box>
  );
};
