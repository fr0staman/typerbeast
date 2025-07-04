import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from "@react-navigation/native";
import { Theme } from "app/theme/constants";
import { useMemo } from "react";

type AppNavContainerProps = {
  children: React.ReactNode;
  theme?: Theme;
};

export const AppNavContainer = ({
  children,
  theme = Theme.Light,
}: AppNavContainerProps) => {
  return (
    <NavigationContainer
      linking={useMemo(
        () => ({
          prefixes: ["/"],
          config: {
            initialRouteName: "login",
            screens: {
              login: "login",
              signup: "signup",
              home: "",
              user: "user/:username",
              g: "g/:text_id",
              dictionaries: "dictionaries",
              "dictionaries/:dict_id": "dictionaries/:dict_id",
              profile: "profile",
            },
          },
        }),
        [],
      )}
      theme={theme === Theme.Dark ? DarkTheme : DefaultTheme}
    >
      {children}
    </NavigationContainer>
  );
};
