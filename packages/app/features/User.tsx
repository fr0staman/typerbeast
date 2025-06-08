"use client";

import { Text, Button, ButtonText } from "@/ui/components";
import { View } from "react-native";
import { useParams, useRouter } from "solito/navigation";
import { useAppTranslation } from "../i18n/hooks";

export function UserScreen() {
  const router = useRouter();
  const { username } = useParams();

  const { t } = useAppTranslation("common");

  return (
    <View className="flex-1 items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 bg-white dark:bg-black">
      <View className={"flex-1 items-center justify-center"}>
        <Text size="2xl" className="mt-2">
          {t("username")}:{" "}
          <Text bold size="2xl">
            {username}
          </Text>
        </Text>
        <Button className="mt-6" onPress={() => router.back()}>
          <ButtonText>{t("goHome")}</ButtonText>
        </Button>
      </View>
    </View>
  );
}
