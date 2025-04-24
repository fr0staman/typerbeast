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
            initialRouteName: "home",
            screens: {
              home: "",
              user: "user/:username",
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
