"use client";

import {
  Box,
  Button,
  ButtonText,
  Heading,
  HStack,
  Link,
  Text,
  VStack,
} from "@/ui/components";
import { Loading } from "../components/Loading";
import dayjs from "dayjs";
import { useLink, useParams } from "solito/navigation";
import { useUserStats } from "../hooks/useUserStats";
import { useUserProfile } from "../hooks/useUserProfile";
import { NotFound } from "../components/NotFound";
import { Badge, BadgeText } from "@/ui/components/Badge";
import { useSession } from "../hooks/useSession";
import { useAppTranslation } from "../i18n/hooks";

const roleToBadgeAction = {
  creator: "info",
  moderator: "success",
  user: "muted",
} as const;

export const UserScreen = () => {
  const { t } = useAppTranslation("common");

  const { username } = useParams<{ username: string }>();

  const { data: session } = useSession();

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

            <Text className="text-sm text-gray-400">
              {t("joined")}: {date}
            </Text>
          </Box>
          {session?.role === "creator" && <LinkChangeUser />}
        </HStack>

        <Box className="bg-gray-800 rounded-lg p-6 shadow space-y-2">
          <Heading as="h2" className="text-xl font-semibold mb-2">
            {t("typingStats")}
          </Heading>
          <Text>
            {t("totalRaces")}:{" "}
            <Text className="font-semibold">{stats?.results_count}</Text>
          </Text>
          <Text>
            {t("averageWpm")}:{" "}
            <Text className="font-semibold">
              {stats?.average_wpm?.toFixed(2)}
            </Text>
          </Text>
          <Text>
            {t("averageCpm")}:{" "}
            <Text className="font-semibold">
              {stats?.average_cpm?.toFixed(2)}
            </Text>
          </Text>
          <Text>
            {t("averageMistakes")}:{" "}
            <Text className="font-semibold">
              {stats?.average_mistakes?.toFixed(2)}
            </Text>
          </Text>
        </Box>
      </VStack>
    </VStack>
  );
};

export const LinkChangeUser = () => {
  const { t } = useAppTranslation("common");
  const { username } = useParams<{ username: string }>();
  const toChangeUserLink = useLink({
    href: `/user/${username}/change`,
  });

  return (
    <Link {...toChangeUserLink}>
      <Button>
        <ButtonText>{t("changeUser")}</ButtonText>
      </Button>
    </Link>
  );
};
