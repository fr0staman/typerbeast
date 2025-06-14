import { View } from "react-native";
import { Text } from "@/ui/components";
import { ActivityIndicator } from "react-native";

export const Loading = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator />
      <Text>Loading session...</Text>
    </View>
  );
};
