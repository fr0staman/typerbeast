"use client";

import { Platform, Pressable, Text, View, Alert } from "react-native";

export const Home = () => {
  const containerStyle = Platform.select({
    default: "flex-1",
    web: "min-h-screen",
  });

  return (
    <View
      className={
        containerStyle +
        " items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 bg-white dark:bg-black"
      }
    >
      <View className={"flex-1 items-center justify-center"}>
        <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center">
          Welcome to TyperBeast 👾
        </Text>
        <Text className="mt-4 text-lg text-gray-600 dark:text-gray-300 text-center">
          {Platform.OS === "web"
            ? "This is the web app."
            : "This is the mobile app."}
        </Text>

        <Pressable
          className={
            "mt-6 rounded-xl bg-indigo-600 px-4 py-2 hover:bg-indigo-700 active:opacity-80"
          }
          onPress={
            Platform.OS === "web"
              ? () => alert("Wow, it works!")
              : () => Alert.alert("Wow, it works!")
          }
        >
          <Text className="text-white text-lg font-medium">Start Typing</Text>
        </Pressable>
      </View>
    </View>
  );
};
