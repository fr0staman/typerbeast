"use client";

import {
  Badge,
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
import { useSession } from "../hooks/useSession";
import dayjs from "dayjs";
import { useMeStats } from "../hooks/useMeStats";
import { BadgeText } from "@/ui/components/Badge";
import { useLink } from "solito/navigation";
import { useAppTranslation } from "../i18n/hooks.web";

const roleToBadgeAction = {
  creator: "info",
  moderator: "success",
  user: "muted",
} as const;

export const ProfileScreen = () => {
  const { t } = useAppTranslation("common");
  const { data: profile, isLoading } = useSession();
  const { data: stats, isLoading: statsLoading } = useMeStats();

  if (isLoading || statsLoading) {
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
              {t("joined")}: {date}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {t("email")}: {profile?.email}
            </Text>
          </Box>
          <HStack className="space-x-3">
            {(profile?.role === "moderator" || profile?.role === "creator") && (
              <LinkToModeratorPanel />
            )}
          </HStack>
        </HStack>

        <Box className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow space-y-2">
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

const LinkToModeratorPanel = () => {
  const { t } = useAppTranslation("common");
  const moderatorPanelLinkProps = useLink({
    href: "/moderate",
  });

  return (
    <Link {...moderatorPanelLinkProps}>
      <Button>
        <ButtonText>{t("moderatorPanel")}</ButtonText>
      </Button>
    </Link>
  );
};
