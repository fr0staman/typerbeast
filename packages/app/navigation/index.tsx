import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "@/app/features/Home";
import { UserScreen } from "@/app/features/User";

const Stack = createNativeStackNavigator<{
  home: undefined;
  user: {
    username: string;
  };
}>();

export function AppStack() {
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
          title: "USER: " + props.route.params.username,
        })}
      />
    </Stack.Navigator>
  );
}
