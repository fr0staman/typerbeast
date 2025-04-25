import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "@/app/features/Home";
import { UserScreen } from "@/app/features/User";
import { useAppTranslation } from "../i18n/hooks";

const Stack = createNativeStackNavigator<{
  home: undefined;
  user: {
    username: string;
  };
}>();

export function AppStack() {
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
