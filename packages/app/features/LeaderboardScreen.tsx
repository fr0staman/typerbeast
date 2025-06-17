"use client";

import { VStack, Text, HStack, Pressable, Box, Link } from "@/ui/components";
import { FlatList, ScrollView } from "react-native";
import { Loading } from "../components/Loading";
import { TopUser, useLeaderboard } from "../hooks/useLeaderboard";
import { useState } from "react";
import { useDictionaries } from "../hooks/useDictionaries";
import { useLink } from "solito/navigation";
import dayjs from "dayjs";
import { useAppTranslation } from "../i18n/hooks";

const leagues = ["Web", "Mobile"] as const;
const periods = ["Day", "Week", "Month", "AllTime"] as const;

export const LeaderboardScreen = () => {
  const { t } = useAppTranslation("common");

  const [selectedDict, setSelectedDict] = useState<string | undefined>();
  const [selectedLeague, setSelectedLeague] = useState<string | undefined>(
    "Web",
  );
  const [selectedPeriod, setSelectedPeriod] = useState<string | undefined>(
    "Day",
  );

  const { data: dictionaries, isLoading: dictionariesLoading } =
    useDictionaries();
  const { data: users, isLoading: leaderboardLoading } = useLeaderboard(
    selectedDict,
    selectedLeague,
    selectedPeriod,
  );

  if (dictionariesLoading) {
    return <Loading />;
  }

  return (
    <VStack className="px-4 py-10">
      <VStack className="w-full md:max-w-7xl mx-auto space-y-8">
        <Text className="text-xl font-bold mb-4 text-center">
          🏆 {t("leaderboard")}
        </Text>
        {/* Filters */}
        <Box className="mb-4">
          <Text className="font-medium mb-1">📚 {t("dictionary")}</Text>
          <ScrollView horizontal className="flex-row gap-2">
            <Box className="flex-row gap-2">
              {dictionaries?.list?.map(d => (
                <Pressable
                  key={d.id}
                  className={`px-3 py-1 rounded-full border ${
                    selectedDict === d.id
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "border-gray-300"
                  }`}
                  onPress={() =>
                    setSelectedDict(d.id === selectedDict ? undefined : d.id)
                  }
                >
                  <Text className="text-sm">{d.name}</Text>
                </Pressable>
              ))}
            </Box>
          </ScrollView>
        </Box>
        <HStack className="justify-between">
          <Box className="mb-4">
            <Text className="font-medium mb-1">📱 {t("league")}</Text>
            <HStack className="flex-row gap-2">
              {leagues.map(l => (
                <Pressable
                  key={l}
                  className={`px-3 py-1 rounded-full border ${
                    selectedLeague === l
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300"
                  }`}
                  onPress={() =>
                    setSelectedLeague(l === selectedLeague ? undefined : l)
                  }
                >
                  <Text className="text-sm">{l}</Text>
                </Pressable>
              ))}
            </HStack>
          </Box>
          <Box className="mb-4">
            <Text className="font-medium mb-1">⏱️ {t("period")}</Text>
            <Box className="flex-row gap-2">
              {periods.map(p => (
                <Pressable
                  key={p}
                  className={`px-3 py-1 rounded-full border ${
                    selectedPeriod === p
                      ? "bg-purple-500 border-purple-500 text-white"
                      : "border-gray-300"
                  }`}
                  onPress={() => setSelectedPeriod(p)}
                >
                  <Text className="text-sm">{p}</Text>
                </Pressable>
              ))}
            </Box>
          </Box>
        </HStack>
        {leaderboardLoading ? (
          <Text className="text-center mt-4">{t("loading")}...</Text>
        ) : (
          <FlatList
            data={users?.users}
            ListEmptyComponent={LeaderboardEmpty}
            renderItem={({ item, index }) => (
              <LeaderboardPlayerItem item={item} index={index} />
            )}
          />
        )}
      </VStack>
    </VStack>
  );
};

type LeaderboardPlayerItem = {
  item: TopUser;
  index: number;
};

const LeaderboardPlayerItem = ({
  item: user,
  index,
}: LeaderboardPlayerItem) => {
  const { t } = useAppTranslation("common");
  const toUserLink = useLink({
    href: `/user/${user.username}`,
  });

  const datetime = dayjs(user.achieved_at).format("DD/MM/YYYY, HH:mm:ss");

  return (
    <Box
      key={user.id}
      className="mb-4 p-4 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow"
    >
      <Link {...toUserLink}>
        <Text className="text-base font-semibold">
          {index + 1}. {user.username}
        </Text>
      </Link>
      <Text className="text-sm text-gray-500 dark:text-gray-400">
        {t("wpm")}:{" "}
        <Text className="text-white font-bold">{user.wpm.toFixed(2)}</Text> |{" "}
        {t("mistakes")}: {user.mistakes}
      </Text>
      <Text className="text-xs mt-1 text-gray-400">
        {t("playedAt")}: {datetime}
      </Text>
      {/*
      <Link
        href={`/rooms/${user.room_id}?result=${user.id}`}
        className="mt-2 text-blue-500 underline"
      >
        <LinkText>View Race</LinkText>
      </Link>
      */}
    </Box>
  );
};

export const LeaderboardEmpty = () => {
  const { t } = useAppTranslation();
  return (
    <Box className="p-4 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow">
      <Text className="text-sm text-gray-500 dark:text-gray-400">
        {t("noUsersFound")}
      </Text>
      <Text className="text-sm text-gray-500 dark:text-gray-400">
        {t("maybeYouWillBeFirst")}
      </Text>
    </Box>
  );
};
