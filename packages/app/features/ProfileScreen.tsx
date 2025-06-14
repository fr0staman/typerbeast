"use client";

import { Text, VStack } from "@/ui/components";
import { Loading } from "../components/Loading";
import { useSession } from "../hooks/useSession";
import dayjs from "dayjs";

export const ProfileScreen = () => {
  const { data: profile, isLoading } = useSession();

  if (isLoading) {
    return <Loading />;
  }

  const date = dayjs(profile?.created_at).format("YYYY-MM-DD");

  return (
    <VStack className="items-center">
      <VStack className="w-full md:max-w-7xl">
        <Text size="2xl">{profile?.username}</Text>

        <Text>Date: {date}</Text>
        <Text>Email: {profile?.email}</Text>
      </VStack>
    </VStack>
  );
};
