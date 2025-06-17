"use client";

import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
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
  Toast,
  ToastTitle,
  useToast,
  VStack,
} from "@/ui/components";
import { Loading } from "../components/Loading";
import dayjs from "dayjs";
import { useParams } from "solito/navigation";
import { useUserProfile } from "../hooks/useUserProfile";
import { NotFound } from "../components/NotFound";
import { Badge, BadgeText } from "@/ui/components/Badge";
import { ChevronDownIcon } from "@/ui/components/Icon";
import { useState } from "react";
import { useMutateUser } from "../hooks/useMutateUser";
import { useQueryClient } from "@tanstack/react-query";

const roleToBadgeAction = {
  creator: "info",
  moderator: "success",
  user: "muted",
} as const;

export const UserChange = () => {
  const { username } = useParams<{ username: string }>();
  const {
    data: profile,
    isLoading,
    isError: isProfileError,
  } = useUserProfile(username);
  const { mutate } = useMutateUser(username);

  const [selectedRole, setSelectedRole] = useState<string>(
    profile?.role || "user",
  );

  const toast = useToast();

  const queryClient = useQueryClient();

  if (isLoading) {
    return <Loading />;
  }

  if (isProfileError) {
    return <NotFound />;
  }

  const date = dayjs(profile?.created_at).format("YYYY-MM-DD");

  function onSubmit() {
    mutate(
      // @ts-expect-error wrong type
      { role: selectedRole },
      {
        onSuccess: () => {
          const newId = Math.random();
          queryClient.invalidateQueries({
            queryKey: ["user-profile_" + username],
          });
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

            <Text className="text-sm text-gray-400">Joined: {date}</Text>
          </Box>
        </HStack>

        <Box className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow space-y-2">
          <Heading as="h2" className="text-xl font-semibold mb-2">
            Change
          </Heading>
          <Select onValueChange={setSelectedRole}>
            <SelectTrigger variant="outline" size="md">
              <SelectInput placeholder={profile?.role} />
              <SelectIcon className="mr-3" as={ChevronDownIcon} />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                {Object.keys(roleToBadgeAction).map(role => (
                  <SelectItem key={role} label={role} value={role} />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        </Box>

        <Button onPress={onSubmit}>
          <ButtonText>Submit</ButtonText>
        </Button>
      </VStack>
    </VStack>
  );
};
