import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "@/app/features/Home";
import { UserScreen } from "@/app/features/User";
import { useAppTranslation } from "@/app/i18n/hooks";
import { LoginScreen } from "@/app/features/LoginScreen";
import { useSession } from "../hooks/useSession";
import { ActivityIndicator, View } from "react-native";

const Stack = createNativeStackNavigator<{
  login: undefined;
  home: undefined;
  user: {
    username: string;
  };
}>();

export const AppStack = () => {
  const { data, isLoading, isError } = useSession();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (!data || isError) {
    return <AuthNavigator />; // Not authenticated
  }

  return <MainNavigator />;
};

export function MainNavigator() {
  const { t } = useAppTranslation("seo");

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="home"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="user"
        component={UserScreen}
        options={props => ({
          title: t("user.title", { id: props.route.params.username }),
        })}
      />
    </Stack.Navigator>
  );
}

export function AuthNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="login"
        component={LoginScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
