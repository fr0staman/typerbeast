"use client";

import { useRef, useState } from "react";
import {
  Input,
  InputField,
  Button,
  ButtonText,
  Heading,
  VStack,
  Box,
  Link,
  LinkText,
} from "@/ui/components";
import { useLink, useRouter } from "solito/navigation";
import { TextInput, View } from "react-native";
import { useRegister } from "@/app/hooks/useRegister";
import { useAppTranslation } from "@/app/i18n/hooks";

export function SignupScreen() {
  const { t } = useAppTranslation("signup");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const passwordInputRef = useRef<TextInput>(null);
  const usernameInputRef = useRef<TextInput>(null);

  const router = useRouter();

  const register = useRegister();

  const loginLinkProps = useLink({
    href: "/login",
  });

  const onSubmit = () => {
    register.mutate(
      { email, password, username },
      {
        onSuccess: () => {
          // TODO: create register logic email check
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
            {t("register")}
          </Heading>

          <Input>
            <InputField
              placeholder={t("placeholder.email")}
              value={email}
              onChangeText={text => setEmail(text)}
              onSubmitEditing={() => usernameInputRef.current?.focus()}
            />
          </Input>
          <Input>
            <InputField
              // @ts-expect-error gluestack type bug
              ref={usernameInputRef}
              placeholder={t("placeholder.username")}
              value={username}
              onChangeText={text => setUsername(text)}
              onSubmitEditing={() => passwordInputRef.current?.focus()}
            />
          </Input>
          <Input>
            <InputField
              // @ts-expect-error gluestack type bug
              ref={passwordInputRef}
              placeholder={t("placeholder.password")}
              value={password}
              onChangeText={text => setPassword(text)}
              secureTextEntry
              onSubmitEditing={onSubmit}
            />
          </Input>

          <Button onPress={onSubmit}>
            <ButtonText>{t("signup")}</ButtonText>
          </Button>

          <Link {...loginLinkProps}>
            <LinkText className="text-gray-300 hover:text-gray-100 transition">
              Already have an account? Login
            </LinkText>
          </Link>
        </VStack>
      </Box>
    </View>
  );
}
