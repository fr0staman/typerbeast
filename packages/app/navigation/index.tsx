import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "@/app/features/Home";
import { UserScreen } from "@/app/features/User";
import { TypingGame } from "@/app/features/TypeText";
import { useAppTranslation } from "@/app/i18n/hooks";
import { LoginScreen } from "@/app/features/LoginScreen";
import { useSession } from "@/app/hooks/useSession";
import { ActivityIndicator, View } from "react-native";
import { SignupScreen } from "@/app/features/SignupScreen";
import { DictionariesScreen } from "../features/DictionariesScreen";
import { DictionaryScreen } from "../features/DictionaryScreen";
import { ProfileScreen } from "../features/ProfileScreen";

const Stack = createNativeStackNavigator<{
  login: undefined;
  signup: undefined;
  home: undefined;
  user: {
    username: string;
  };
  g: {
    text_id: string;
  };
  dictionaries: undefined;
  "dictionaries/:dict_id": {
    dict_id: string;
  };
  profile: undefined;
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
      <Stack.Screen
        name="g"
        component={TypingGame}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="dictionaries"
        component={DictionariesScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="dictionaries/:dict_id"
        component={DictionaryScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}
