"use client";

import { useState } from "react";
import {
  Box,
  Input,
  InputField,
  Button,
  ButtonText,
  Heading,
  Text,
  VStack,
} from "@/ui/components";
import { useRouter } from "solito/navigation";
import { View } from "react-native";
import { useLogin } from "@/app/hooks/useLogin";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const login = useLogin();

  const onSubmit = () => {
    login.mutate(
      { email, password },
      {
        onSuccess: () => {
          router.replace("/");
        },
      },
    );
  };

  return (
    <View
      className={
        "flex-1 items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 bg-white dark:bg-black"
      }
    >
      <Box className="flex-1 justify-center align-center px-4">
        <VStack className="max-w-md" space="md">
          <Heading size="lg" className="text-center">
            Sign In
          </Heading>

          <Input>
            <InputField
              placeholder="Email"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </Input>

          <Input>
            <InputField
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </Input>

          <Button onPress={onSubmit} isDisabled={login.isPending}>
            <ButtonText>
              {login.isPending ? "Signing in..." : "Login"}
            </ButtonText>
          </Button>

          {login.isError && (
            <Text className="color-red-600 text-center">
              {login.error.message || "Login failed"}
            </Text>
          )}
        </VStack>
      </Box>
    </View>
  );
}
