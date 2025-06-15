"use client";

import { useRef, useState } from "react";
import {
  Box,
  Input,
  InputField,
  Button,
  ButtonText,
  Heading,
  Text,
  VStack,
  Link,
  LinkText,
} from "@/ui/components";
import { useLink, useRouter } from "solito/navigation";
import { TextInput, View } from "react-native";
import { useLogin } from "@/app/hooks/useLogin";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const passwordInputRef = useRef<TextInput>(null);

  const signupLinkProps = useLink({
    href: "/signup",
  });

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
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
          </Input>

          <Input>
            <InputField
              // @ts-expect-error gluestack type bug
              ref={passwordInputRef}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={onSubmit}
            />
          </Input>

          <Button
            onPress={onSubmit}
            isDisabled={login.isPending}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ButtonText>
              {login.isPending ? "Signing in..." : "Login"}
            </ButtonText>
          </Button>

          {login.isError && (
            <Text className="color-red-600 text-center">
              {login.error.message || "Login failed"}
            </Text>
          )}
          <Link {...signupLinkProps}>
            <LinkText className="text-gray-300 hover:text-gray-100 transition">
              Don't have an account? Register
            </LinkText>
          </Link>
        </VStack>
      </Box>
    </View>
  );
}
