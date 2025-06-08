"use client";

import { useState } from "react";
import {
  Input,
  InputField,
  Button,
  ButtonText,
  Heading,
  VStack,
  Box,
} from "@/ui/components";
import { useRouter } from "solito/navigation";
import { View } from "react-native";
import { useRegister } from "@/app/hooks/useRegister";
import { useAppTranslation } from "@/app/i18n/hooks";

export function SignupScreen() {
  const { t } = useAppTranslation("signup");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const router = useRouter();

  const register = useRegister();

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
            />
          </Input>
          <Input>
            <InputField
              placeholder={t("placeholder.username")}
              value={username}
              onChangeText={text => setUsername(text)}
            />
          </Input>
          <Input>
            <InputField
              placeholder={t("placeholder.password")}
              value={password}
              onChangeText={text => setPassword(text)}
              secureTextEntry
            />
          </Input>

          <Button onPress={onSubmit}>
            <ButtonText>{t("signup")}</ButtonText>
          </Button>
        </VStack>
      </Box>
    </View>
  );
}
