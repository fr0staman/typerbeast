"use client";

import { useState } from "react";
import { Platform, View } from "react-native";
import { Button, ButtonText } from "@/ui/components/Button";
import { Text } from "@/ui/components/Text";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/ui/components/Toast";
import { useLink } from "solito/navigation";
import { useAppTranslation } from "@/app/i18n/hooks";

const CHOSEN_USER = "fr0staman";

export const HomeScreen = () => {
  const toast = useToast();
  const [toastId, setToastId] = useState(0);

  const { t } = useAppTranslation("common");
  const linkProps = useLink({
    href: `/user/${CHOSEN_USER}`,
  });

  const handleToast = () => {
    if (!toast.isActive(toastId.toString())) {
      showNewToast();
    }
  };
  const showNewToast = () => {
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
  };

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
          {Platform.OS === "web" ? t("thisIsWeb") : t("thisIsMobile")}
        </Text>

        <View className="flex gap-4 items-center flex-col sm:flex-row">
          <Button className="mt-6" onPress={handleToast}>
            <ButtonText>{t("startTyping")}</ButtonText>
          </Button>
          <Button className="mt-6" {...linkProps}>
            <ButtonText>{t("linkToUser", { id: CHOSEN_USER })}</ButtonText>
          </Button>
        </View>
      </View>
    </View>
  );
};
