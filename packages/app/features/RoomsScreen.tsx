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
            Available Rooms
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
  //const { t } = useAppTranslation("rooms");
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
            Room{" "}
            <Text className="text-blue-400">{item.room_id.slice(0, 8)}</Text>
          </Text>
          <Text className="text-sm text-gray-400">
            Dictionary:{" "}
            <Text className="text-gray-300">{item.dictionary.name}</Text>
          </Text>
        </Box>
        <Box>
          <Text>
            Players:{" "}
            <Text className="font-medium text-gray-300">{item.players}</Text>
          </Text>
          <Text>
            Status:{" "}
            <Text
              className={
                item.started
                  ? "text-red-400 font-semibold"
                  : "text-green-400 font-semibold"
              }
            >
              {item.started ? "Started" : "Waiting"}
            </Text>
          </Text>
        </Box>
      </Box>
    </Link>
  );
};

const RoomsEmpty = () => {
  return (
    <Box className="p-4 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow">
      <Text className="text-sm text-gray-500 dark:text-gray-400">
        No rooms found.
      </Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400">
        But you can create one!
      </Text>
    </Box>
  );
};
