"use client";

import { useLink, useParams } from "solito/navigation";
import { useDictionary } from "../hooks/useDictionary";
import {
  VStack,
  HStack,
  Heading,
  LinkText,
  Button,
  ButtonText,
  Text,
  Link,
  Box,
  Input,
  InputField,
  Textarea,
  TextareaInput,
  useToast,
  Toast,
  ToastTitle,
} from "@/ui/components";
import dayjs from "dayjs";
import { Loading } from "../components/Loading";
import { useState } from "react";
import { useSuggestText } from "../hooks/useSuggestText";
import { useQueryClient } from "@tanstack/react-query";

export const DictionarySuggestText = () => {
  const { dict_id } = useParams<{ dict_id: string }>();

  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const { data: dictionary, isLoading } = useDictionary(dict_id);

  const { mutate } = useSuggestText();
  const toUserLink = useLink({
    href: `/user/${dictionary?.dictionary?.user?.username}`,
  });

  const toast = useToast();

  if (isLoading) {
    return <Loading />;
  }

  const date = dayjs(dictionary?.dictionary.created_at).format("YYYY-MM-DD");

  function onSubmit() {
    mutate(
      { title, content, dictionary_id: dict_id },
      {
        onSuccess: () => {
          const newId = Math.random();
          queryClient.invalidateQueries({ queryKey: ["dictionary" + dict_id] });
          toast.show({
            id: newId.toString(),
            placement: "top",
            duration: 3000,

            render: ({ id }) => {
              const uniqueToastId = "toast-" + id;
              return (
                <Toast nativeID={uniqueToastId} action="muted" variant="solid">
                  <ToastTitle>{"Success!"}</ToastTitle>
                </Toast>
              );
            },
          });
        },
      },
    );
  }

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
        </HStack>

        <Box className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow space-y-2">
          <Heading as="h2" className="text-xl font-semibold mb-2">
            Suggest text
          </Heading>

          <Input>
            <InputField onChangeText={setTitle} placeholder="title" />
          </Input>

          <Textarea>
            <TextareaInput onChangeText={setContent} placeholder="content" />
          </Textarea>

          <Button onPress={onSubmit}>
            <ButtonText>Submit</ButtonText>
          </Button>
        </Box>
      </VStack>
    </VStack>
  );
};
