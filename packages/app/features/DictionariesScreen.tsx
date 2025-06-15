"use client";

import { useLink } from "solito/navigation";
import { Dictionary, useDictionaries } from "../hooks/useDictionaries";
import { Loading } from "../components/Loading";
import { Link, LinkText, VStack } from "@/ui/components";
import { FlatList } from "react-native";

export const DictionariesScreen = () => {
  //const { t } = useAppTranslation("common");

  const { data: dictionaries, isLoading } = useDictionaries();

  if (isLoading) {
    <Loading />;
  }

  return (
    <VStack className="flex-1 p-4 bg-background space-y-4 items-center">
      <VStack className="w-full md:max-w-7xl">
        <FlatList
          data={dictionaries?.list}
          renderItem={({ item }) => <DictionaryItem item={item} />}
        />
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

  return (
    <Link {...toDictionaryLinks}>
      <LinkText>{item.name}</LinkText>
    </Link>
  );
};
