"use client";

import { Text, VStack } from "@/ui/components";
import { Loading } from "../components/Loading";
import { useSession } from "../hooks/useSession";
import dayjs from "dayjs";
import { useMeStats } from "../hooks/useMeStats";

export const ProfileScreen = () => {
  const { data: profile, isLoading } = useSession();
  const { data: stats, isLoading: statsLoading } = useMeStats();

  if (isLoading || statsLoading) {
    return <Loading />;
  }

  const date = dayjs(profile?.created_at).format("YYYY-MM-DD");

  return (
    <VStack className="items-center">
      <VStack className="w-full md:max-w-7xl">
        <Text size="2xl">{profile?.username}</Text>

        <Text>Date: {date}</Text>
        <Text>Email: {profile?.email}</Text>

        <Text>Total races: {stats?.results_count}</Text>
        <Text>Average wpm: {stats?.average_wpm}</Text>
        <Text>Average cpm: {stats?.average_cpm}</Text>
        <Text>Average mistakes: {stats?.average_mistakes}</Text>
      </VStack>
    </VStack>
  );
};
