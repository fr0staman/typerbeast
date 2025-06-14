"use client";

import { useLink, useParams } from "solito/navigation";
import { Loading } from "../components/Loading";
import {
  useDictionary,
  Text as DictionaryTextType,
} from "../hooks/useDictionary";
import { HStack, Link, LinkText, Text, VStack } from "@/ui/components";
import { FlatList } from "react-native";
import dayjs from "dayjs";

export const DictionaryScreen = () => {
  const { dict_id } = useParams<{ dict_id: string }>();

  const { data: dictionary, isLoading } = useDictionary(dict_id);

  const goBackProps = useLink({
    href: "/dictionaries",
  });

  if (isLoading) {
    return <Loading />;
  }

  const date = dayjs(dictionary?.dictionary.created_at).format("YYYY-MM-DD");

  return (
    <VStack className="items-center">
      <VStack className="w-full md:max-w-7xl">
        <Link {...goBackProps}>
          <LinkText>Go Back</LinkText>
        </Link>
        <Text bold size="xl">
          {dictionary?.dictionary.name}
        </Text>
        <Text>Date: {date}</Text>
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
    <VStack>
      <HStack className="justify-between items-center">
        <Text size="lg">
          {index}. {item.title}
        </Text>
        <Text>{date}</Text>
      </HStack>
      <Text size="md">{item.content}</Text>
    </VStack>
  );
};
