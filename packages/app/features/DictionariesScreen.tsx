"use client";

import { useLink } from "solito/navigation";
import { Dictionary, useDictionaries } from "../hooks/useDictionaries";
import { Loading } from "../components/Loading";
import {
  Box,
  Button,
  ButtonText,
  Heading,
  Link,
  VStack,
  Text,
  HStack,
  LinkText,
} from "@/ui/components";
import { FlatList } from "react-native";

export const DictionariesScreen = () => {
  //const { t } = useAppTranslation("common");

  const { data: dictionaries, isLoading } = useDictionaries();

  if (isLoading) {
    <Loading />;
  }

  return (
    <VStack className="flex-1 space-y-4 items-center px-6 py-10">
      <VStack className="w-full md:max-w-7xl mx-auto space-y-8">
        <Heading as="h1" className="text-2xl font-bold">
          Dictionaries
        </Heading>
        <Box>
          <FlatList
            data={dictionaries?.list}
            renderItem={({ item }) => <DictionaryItem item={item} />}
          />
        </Box>
      </VStack>
    </VStack>
  );
};

type DictionaryItem = {
  item: Dictionary;
};

export const DictionaryItem = ({ item }: DictionaryItem) => {
  const toDictionaryLinks = useLink({
    href: `/dictionaries/${item.id}`,
  });

  const toUserLink = useLink({
    href: `/user/${item.user.username}`,
  });

  return (
    <Box className="bg-white dark:bg-gray-800 border border-gray-700 rounded-lg p-5 shadow mb-6">
      <HStack className="flex items-center justify-between">
        <Link {...toDictionaryLinks}>
          <Heading
            as="h2"
            className="text-xl font-semibold text-blue-400 hover:underline cursor-pointer"
          >
            {item.name}
          </Heading>
        </Link>
        <Button>
          <ButtonText>Start Room</ButtonText>
        </Button>
      </HStack>

      <Box className="mt-3 text-sm text-gray-500 dark:text-gray-400  space-y-1">
        <HStack>
          <Text className="text-gray-500 dark:text-gray-400">Author: </Text>
          <Link {...toUserLink}>
            <LinkText>{item.user.username}</LinkText>
          </Link>
        </HStack>
        <Text>
          <Text className="text-gray-500 dark:text-gray-400">Created:</Text>{" "}
          {item.created_at}
        </Text>
        <Text>
          <Text className="text-gray-500 dark:text-gray-400">Text count: </Text>
          {item.text_count}
        </Text>
      </Box>
    </Box>
  );
};
