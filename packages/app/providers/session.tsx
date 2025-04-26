"use client";

import { ReactNode, useEffect } from "react";
import { useSession } from "@/app/hooks/useSession";
import { useRouter } from "solito/navigation";
import { View, Text, ActivityIndicator } from "react-native";

interface Props {
  children: ReactNode;
  protected?: boolean; // Is this a protected page?
}

export function SessionProvider({
  children,
  protected: isProtected = true,
}: Props) {
  const { isLoading, isError } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isProtected && isError) {
        router.replace("/login");
      }
      if (!isProtected && !isError) {
        router.replace("/");
      }
    }
  }, [isLoading, isError, isProtected, router]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
        <Text>Loading session...</Text>
      </View>
    );
  }

  return <>{children}</>;
}
