"use client";

import { useState } from "react";
import { Platform, View } from "react-native";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
  Text,
  Button,
  ButtonText,
} from "@/ui/components";
import { useLink } from "solito/navigation";
import { useAppTranslation } from "@/app/i18n/hooks";
import { useSession } from "@/app/hooks/useSession";

export const HomeScreen = () => {
  const { data } = useSession();

  const toast = useToast();
  const [toastId, setToastId] = useState(0);

  const { t } = useAppTranslation("common");
  const CHOSEN_USER = data?.username;

  function handleToast() {
    if (!toast.isActive(toastId.toString())) {
      showNewToast();
    }
  }

  function showNewToast() {
    const newId = Math.random();
    setToastId(newId);
    toast.show({
      id: newId.toString(),
      placement: "top",
      duration: 3000,
      render: ({ id }) => {
        const uniqueToastId = "toast-" + id;
        return (
          <Toast nativeID={uniqueToastId} action="muted" variant="solid">
            <ToastTitle>{t("toastTitle")}</ToastTitle>
            <ToastDescription>{t("toastDescription")}</ToastDescription>
          </Toast>
        );
      },
    });
  }

  const linkProps = useLink({
    href: `/user/${CHOSEN_USER}`,
  });

  const toTextLinkProps = useLink({
    // Hardcoded text_id. In future this should be changes to room_id, that's normal for prototyping.
    href: `/g/36a781f8-fad5-4941-9a88-4310c7b4fc31`,
  });

  const platformMessage =
    Platform.OS === "web" ? t("thisIsWeb") : t("thisIsMobile");

  return (
    <View
      className={
        "flex-1 min-h-screen items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 bg-white dark:bg-black"
      }
    >
      <View className={"flex-1 items-center justify-center"}>
        <Text bold size="3xl">
          {t("welcome")}
        </Text>
        <Text className="mt-4" size="lg">
          {platformMessage}
        </Text>

        <View className="flex gap-4 items-center flex-col sm:flex-row">
          <Button className="mt-6" onPress={handleToast}>
            <ButtonText>{t("startTyping")}</ButtonText>
          </Button>
          <Button className="mt-6" {...linkProps}>
            <ButtonText>{t("linkToUser", { id: CHOSEN_USER })}</ButtonText>
          </Button>
          <Button className="mt-6" {...toTextLinkProps}>
            <ButtonText>{t("linkToText", { id: 1 })}</ButtonText>
          </Button>
        </View>
      </View>
    </View>
  );
};
