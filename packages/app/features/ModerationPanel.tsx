"use client";

import {
  Badge,
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Input,
  InputField,
  Link,
  LinkText,
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectPortal,
  SelectTrigger,
  Text,
  VStack,
} from "@/ui/components";
import { Loading } from "../components/Loading";
import { useSession } from "../hooks/useSession";
import dayjs from "dayjs";
import { BadgeText } from "@/ui/components/Badge";
import { useLink } from "solito/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { PendingText, usePendingTexts } from "../hooks/usePendingTexts";
import { FlatList } from "react-native";
import { ChevronDownIcon } from "@/ui/components/Icon";
import { useState } from "react";
import { useDecisionText } from "../hooks/useDecisionText";

const pendingStatuses = ["pending", "rejected", "approved"] as const;

const roleToBadgeAction = {
  creator: "info",
  moderator: "success",
  user: "muted",
} as const;

export const ModerationPanel = () => {
  const { data: profile, isLoading } = useSession();
  const { data: pendingTexts, isLoading: pendingTextsLoading } =
    usePendingTexts();

  if (isLoading || pendingTextsLoading) {
    return <Loading />;
  }

  const date = dayjs(profile?.created_at).format("YYYY-MM-DD");

  return (
    <VStack className="items-center text-gray-200 px-6 py-10">
      <VStack className="w-full md:max-w-7xl mx-auto space-y-6">
        <HStack className="flex items-center justify-between border-b border-gray-700 pb-4">
          <Box>
            <HStack className="space-x-3">
              <Text size="3xl" className="font-bold">
                {profile?.username}{" "}
              </Text>
              <VStack className="justify-center">
                <Badge
                  size="md"
                  action={roleToBadgeAction[profile?.role || "user"] || "muted"}
                >
                  <BadgeText>{profile?.role}</BadgeText>
                </Badge>
              </VStack>
            </HStack>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Joined: {date}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              Email: {profile?.email}
            </Text>
          </Box>
          <HStack className="space-x-3">
            <LinkToProfile />
          </HStack>
        </HStack>

        <Box className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow space-y-2">
          <Heading as="h2" className="text-xl font-semibold mb-2">
            Pending texts
          </Heading>

          <FlatList
            data={pendingTexts?.list}
            renderItem={({ item, index }) => (
              <PendingTextItem item={item} index={index} />
            )}
            // eslint-disable-next-line react/no-unstable-nested-components
            ListEmptyComponent={() => <Text>No pending texts.</Text>}
          />
        </Box>
      </VStack>
    </VStack>
  );
};

export type PendingTextItem = {
  item: PendingText;
  index: number;
};

const PendingTextItem = ({ item, index }: PendingTextItem) => {
  const [status, setStatus] = useState(item.status);
  const [reason, setReason] = useState(item.reason);

  const { mutate } = useDecisionText();
  const queryClient = useQueryClient();

  const toUserLink = useLink({
    href: `/user/${item.author.username}`,
  });

  const toDictionaryLink = useLink({
    href: `/dictionaries/${item.dictionary.id}`,
  });

  function onSubmit() {
    mutate(
      {
        text_id: item.id,
        status,
        reason,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["pending-texts"] });
        },
      },
    );
  }

  const datetime = dayjs(item.created_at).format("DD/MM/YYYY, HH:mm:ss");
  return (
    <VStack className="mb-4 space-y-3">
      <HStack className="space-x-3">
        <Heading as="h3">
          {index + 1}. {item.title}
        </Heading>
      </HStack>
      <Box className="mt-3 text-sm text-gray-500 dark:text-gray-400  space-y-1">
        <HStack>
          <Text className="text-gray-500 dark:text-gray-400">Author: </Text>
          <Link {...toUserLink}>
            <LinkText>{item.author.username}</LinkText>
          </Link>
        </HStack>
        <HStack>
          <Text className="text-gray-500 dark:text-gray-400">Dictionary: </Text>
          <Link {...toDictionaryLink}>
            <LinkText>{item.dictionary.name}</LinkText>
          </Link>
        </HStack>
        <Text>
          <Text className="text-gray-500 dark:text-gray-400">Created:</Text>{" "}
          {datetime}
        </Text>
      </Box>
      <Box className="">
        <Text className="font-mono leading-relaxed">{item.content}</Text>
      </Box>
      <HStack className="space-x-3">
        <Select onValueChange={setStatus}>
          <SelectTrigger variant="outline" size="md">
            <SelectInput placeholder={status} />
            <SelectIcon className="mr-3" as={ChevronDownIcon} />
          </SelectTrigger>
          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              {pendingStatuses.map(role => (
                <SelectItem key={role} label={role} value={role} />
              ))}
            </SelectContent>
          </SelectPortal>
        </Select>

        <Input>
          <InputField
            value={reason || ""}
            placeholder="Reason"
            onChangeText={setReason}
          />
        </Input>
        <Button onPress={onSubmit}>
          <ButtonText>Submit</ButtonText>
        </Button>
      </HStack>
    </VStack>
  );
};

const LinkToProfile = () => {
  const toProfileLinkProps = useLink({
    href: "/profile",
  });

  return (
    <Link {...toProfileLinkProps}>
      <Button>
        <ButtonText>Back to profile</ButtonText>
      </Button>
    </Link>
  );
};
