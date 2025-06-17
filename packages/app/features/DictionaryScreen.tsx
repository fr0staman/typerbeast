"use client";

import { useLink, useParams } from "solito/navigation";
import { Loading } from "../components/Loading";
import {
  useDictionary,
  Text as DictionaryTextType,
} from "../hooks/useDictionary";
import {
  Button,
  ButtonText,
  Heading,
  HStack,
  Link,
  LinkText,
  Text,
  VStack,
} from "@/ui/components";
import { FlatList } from "react-native";
import dayjs from "dayjs";

export const DictionaryScreen = () => {
  const { dict_id } = useParams<{ dict_id: string }>();

  const { data: dictionary, isLoading } = useDictionary(dict_id);

  const toUserLink = useLink({
    href: `/user/${dictionary?.dictionary?.user?.username}`,
  });

  const suggestTextLink = useLink({
    href: `/dictionaries/${dict_id}/suggest`,
  });

  if (isLoading) {
    return <Loading />;
  }

  const date = dayjs(dictionary?.dictionary.created_at).format("YYYY-MM-DD");

  return (
    <VStack className="items-center px-6 py-10">
      <VStack className="w-full md:max-w-7xl mx-auto space-y-6">
        <HStack className="justify-between">
          <VStack>
            <Heading
              as="h1"
              className="text-2xl font-bold text-gray-700 dark:text-blue-400"
            >
              {dictionary?.dictionary.name}
            </Heading>
            <Link {...toUserLink}>
              <Text className="text-sm text-gray-700 dark:text-gray-400">
                Author:{" "}
                <LinkText>{dictionary?.dictionary?.user?.username}</LinkText>
              </Text>
            </Link>
            <Text className="text-sm text-gray-700 dark:text-gray-400">
              Created on: {date}
            </Text>
          </VStack>
          <Link {...suggestTextLink}>
            <Button>
              <ButtonText>Suggest text</ButtonText>
            </Button>
          </Link>
        </HStack>
        <FlatList
          data={dictionary?.list}
          renderItem={({ item, index }) => (
            <DictionaryText item={item} index={index} />
          )}
        />
      </VStack>
    </VStack>
  );
};

type DictionaryText = {
  item: DictionaryTextType;
  index: number;
};

export const DictionaryText = ({ item, index }: DictionaryText) => {
  const date = dayjs(item.created_at).format("YYYY-MM-DD");

  return (
    <VStack className="mb-6 bg-white dark:bg-gray-900 border border-gray-700 rounded-lg p-4 shadow">
      <HStack className="justify-between items-center">
        <Heading as="h2" className="font-semibold text-lg">
          {index}. {item.title}
        </Heading>
        <Text className="text-sm text-gray-700 dark:text-gray-400">{date}</Text>
      </HStack>
      <Text className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
        {item.content}
      </Text>
    </VStack>
  );
};
