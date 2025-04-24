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

const CHOSEN_USER = "fr0staman";

export const HomeScreen = () => {
  const toast = useToast();
  const [toastId, setToastId] = useState(0);
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
            <ToastTitle>Hello!</ToastTitle>
            <ToastDescription>
              This is a customized toast message.
            </ToastDescription>
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
          Welcome to TyperBeast 👾
        </Text>
        <Text className="mt-4" size="lg">
          {Platform.OS === "web"
            ? "This is the web app."
            : "This is the mobile app."}
        </Text>

        <View className="flex gap-4 items-center flex-col sm:flex-row">
          <Button className="mt-6" onPress={handleToast}>
            <ButtonText>Start Typing</ButtonText>
          </Button>
          <Button className="mt-6" {...linkProps}>
            <ButtonText>Go to {CHOSEN_USER}</ButtonText>
          </Button>
        </View>
      </View>
    </View>
  );
};
