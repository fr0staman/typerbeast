"use client";

import { Text, VStack } from "@/ui/components";
import { Loading } from "../components/Loading";
import dayjs from "dayjs";
import { useParams } from "solito/navigation";
import { useUserStats } from "../hooks/useUserStats";
import { useUserProfile } from "../hooks/useUserProfile";
import { NotFound } from "../components/NotFound";

export const UserScreen = () => {
  const { username } = useParams<{ username: string }>();

  const {
    data: profile,
    isLoading,
    isError: isProfileError,
  } = useUserProfile(username);
  const {
    data: stats,
    isLoading: statsLoading,
    isError: isStatsError,
  } = useUserStats(username);

  if (isLoading || statsLoading) {
    return <Loading />;
  }

  if (isStatsError || isProfileError) {
    return <NotFound />;
  }

  const date = dayjs(profile?.created_at).format("YYYY-MM-DD");

  return (
    <VStack className="items-center">
      <VStack className="w-full md:max-w-7xl">
        <Text size="2xl">{profile?.username}</Text>

        <Text>Date: {date}</Text>

        <Text>Total races: {stats?.results_count}</Text>
        <Text>Average wpm: {stats?.average_wpm}</Text>
        <Text>Average cpm: {stats?.average_cpm}</Text>
        <Text>Average mistakes: {stats?.average_mistakes}</Text>
      </VStack>
    </VStack>
  );
};
