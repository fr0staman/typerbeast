"use client";

import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  Progress,
  Skeleton,
  InputField,
  ButtonText,
  ProgressFilledTrack,
} from "@/ui/components";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "solito/navigation";
import { useWebSocketGame } from "@/app/hooks/useWebSocketGame"; // Import custom hook
import { useAppTranslation } from "@/app/i18n/hooks";

export const TypingGame = () => {
  const { text_id } = useParams<{ text_id: string }>();

  const {
    textToType,
    progress,
    mistakes,
    speed,
    finished,
    loading,
    countdown,
    sendKeystroke,
  } = useWebSocketGame(text_id);

  const [userInput, setUserInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useAppTranslation("typeText");
  const router = useRouter();

  useEffect(() => {
    if (countdown === null) {
      inputRef.current?.focus();
    }
  }, [countdown]);

  const handleChangeText = (text: string) => {
    const nextChar = text.slice(-1);
    setUserInput(text);
    sendKeystroke(nextChar);
  };

  const resetGame = () => {
    router.replace(`/g/${text_id}`);
  };

  const TextWithHighlight = useCallback(
    function TextWithHighlight() {
      return textToType.split("").map((char, index) => {
        const typedChar = userInput[index];
        const isCorrect = typedChar === char;
        const className = isCorrect
          ? "text-green-600"
          : typedChar
            ? "text-red-600"
            : "text-gray-600";
        return (
          <Text key={index} className={className}>
            {char}
          </Text>
        );
      });
    },
    [textToType, userInput],
  );

  return (
    <Box className="flex-1 flex-col items-center justify-start p-6 min-h-screen">
      <Box className="flex w-full justify-between mb-4">
        <Text className="text-lg font-bold">typerbeast</Text>
        {countdown !== null && (
          <Text className="text-lg text-blue-600">
            {t("startsIn", { countdown })}
          </Text>
        )}
      </Box>

      <VStack className="w-full max-w-md space-y-6">
        <Box className="w-full min-h-[100px] rounded-md border border-gray-300 p-4">
          <Skeleton isLoaded={!loading} className="h-[20px] w-full" />
          {!loading && (
            <Text className="text-base leading-relaxed break-words">
              <TextWithHighlight />
            </Text>
          )}
        </Box>

        <Input
          className="mt-4"
          size="lg"
          isDisabled={loading || countdown !== null || finished}
        >
          <InputField
            // @ts-expect-error gluestack ref typing bug
            ref={inputRef}
            value={userInput}
            onChangeText={handleChangeText}
            placeholder={loading ? t("waitingForText") : t("startTyping")}
            disabled={loading || countdown !== null || finished}
          />
        </Input>

        <Progress value={progress} size="md" className="w-full mt-4">
          <ProgressFilledTrack />
        </Progress>
        <Text className="mt-2 text-center">
          {t("progressWith", { progress: progress.toFixed(1) })}
        </Text>
        <Text className="text-center">{t("mistakesWith", { mistakes })}</Text>
        <Text className="text-center">
          {t("speedWith", { speed: speed.toFixed(1) })}
        </Text>

        {finished && (
          <Box className="flex flex-col items-center mt-6 space-y-2">
            <Text className="text-lg text-green-600">{t("finished")}</Text>
            <Button onPress={resetGame} className="mt-2">
              <ButtonText>{t("restart")}</ButtonText>
            </Button>
          </Box>
        )}
      </VStack>
    </Box>
  );
};
