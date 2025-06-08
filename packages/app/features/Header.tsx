"use client";

import { HStack, Text, Image, Link, LinkText } from "@/ui/components";
//import { User } from "lucide-react-native";
import { useLink } from "solito/navigation";

export const Header = () => {
  const profileLinkProps = useLink({
    href: "/profile",
  });

  return (
    <HStack className="justify-center px-4 py-3 dark:bg-gray-800 items-center">
      <HStack space="md" className="w-full md:max-w-7xl items-center">
        {/* Left: Logo + Name */}
        <HStack className="items-center" space="md">
          <Image
            size="xs"
            // TODO: add logo
            source={{ uri: "https://your-cdn.com/logo.png" }}
            alt="Site Logo"
            width={24}
            height={24}
            borderRadius={24}
          />
          <Text size="md" bold>
            TYPERBEAST
          </Text>
        </HStack>

        <HStack space="lg" className="flex-1 justify-end items-center">
          {/* Right: Profile Icon */}
          <Link {...profileLinkProps}>
            <LinkText>Profile</LinkText>
          </Link>
        </HStack>
      </HStack>
    </HStack>
  );
};
