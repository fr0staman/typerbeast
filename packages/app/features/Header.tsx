"use client";

import { HStack, Text, Link, LinkText } from "@/ui/components";
import { useLink } from "solito/navigation";
import { LangSwitch } from "../components/LangSwitch";
import { useAppTranslation } from "../i18n/hooks";

export const Header = () => {
  const { t } = useAppTranslation("common");
  const profileLinkProps = useLink({
    href: "/profile",
  });

  const dictionariesLinkProps = useLink({
    href: "/dictionaries",
  });

  const leaderboardLinkProps = useLink({
    href: "/leaderboard",
  });

  const homeLinkProps = useLink({
    href: "/",
  });

  return (
    <HStack className="justify-center px-4 py-3 dark:bg-gray-800 items-center">
      <HStack space="xl" className="w-full md:max-w-7xl items-center">
        <HStack className="items-center" space="md">
          <Link {...homeLinkProps}>
            <Text size="md" bold>
              TYPERBEAST
            </Text>
          </Link>
        </HStack>

        <HStack space="lg" className="flex-1 items-center">
          <Link {...dictionariesLinkProps}>
            <LinkText>{t("dictionaries")}</LinkText>
          </Link>

          <Link {...leaderboardLinkProps}>
            <LinkText>{t("leaderboard")}</LinkText>
          </Link>
        </HStack>

        <LangSwitch />

        <HStack space="lg" className="flex-1 justify-end items-center">
          {/* Right: Profile Icon */}
          <Link {...profileLinkProps}>
            <LinkText>{t("profile")}</LinkText>
          </Link>
        </HStack>
      </HStack>
    </HStack>
  );
};
