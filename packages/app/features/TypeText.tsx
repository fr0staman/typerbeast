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
  HStack,
} from "@/ui/components";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "solito/navigation";
import { useWebSocketGame } from "@/app/hooks/useWebSocketGame"; // Import custom hook
import { useAppTranslation } from "@/app/i18n/hooks";
import { useSession } from "@/app/hooks/useSession";

export const TypingGame = () => {
  const { room_id } = useParams<{ room_id: string }>();
  const { data } = useSession();

  const {
    textToType,
    progress,
    mistakes,
    speed,
    finished,
    loading,
    countdown,
    sendKeystroke,
    makeForceStart,
    players,
    startTime,
  } = useWebSocketGame(room_id);

  const [userInput, setUserInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useAppTranslation("typeText");

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

  const TextWithHighlight = useCallback(
    function TextWithHighlight() {
      return textToType.split("").map((char, index) => {
        const typedChar = userInput[index];
        const isCorrect = typedChar === char;
        const className = isCorrect
          ? "text-green-500 font-medium"
          : typedChar
            ? "text-red-500 font-medium"
            : "text-gray-400";
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
    <VStack className="px-4 py-10 items-center space-y-6">
      <VStack className="w-full md:max-w-7xl mx-auto items-center space-y-8">
        <Box className="space-y-4 text-center mb-4">
          {countdown === null && !startTime && (
            <Button onPress={() => makeForceStart(room_id)}>
              <ButtonText>{t("start")}</ButtonText>
            </Button>
          )}
          {countdown !== null && (
            <Text className="text-lg text-blue-600">
              {t("startsIn", { countdown })}
            </Text>
          )}
        </Box>

        <Box className="w-full max-w-xl border border-gray-600 rounded p-4 bg-white dark:bg-gray-900 text-lg font-mono leading-relaxed">
          <Skeleton isLoaded={!loading} className="h-[20px] w-full" />
          {!loading && (
            <Text>
              <TextWithHighlight />
            </Text>
          )}
        </Box>

        <Input
          className="w-full max-w-xl bg-white dark:bg-black border border-gray-500 rounded px-4 py-2 text-gray-500 dark:text-white text-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
          size="lg"
          isDisabled={loading || countdown !== null || finished}
        >
          <InputField
            type="text"
            // @ts-expect-error gluestack ref typing bug
            ref={inputRef}
            value={userInput}
            onChangeText={handleChangeText}
            placeholder={loading ? t("waitingForText") : t("startTyping")}
            disabled={loading || countdown !== null || finished}
          />
        </Input>

        <Progress value={progress} size="md" className="max-w-xl mt-4">
          <ProgressFilledTrack />
        </Progress>

        <VStack className="w-full max-w-xl space-y-2 justify-between text-sm font-mono text-gray-300">
          {players.map(player => (
            <HStack
              key={player.username}
              className="flex justify-between items-center"
            >
              <Text className="">{player.username} </Text>
              <Text className="text-gray-600 dark:text-gray-100 animate-pulse">
                {data?.username === player.username
                  ? progress.toFixed(1)
                  : player.progress.toFixed(1)}
                %
              </Text>
            </HStack>
          ))}
        </VStack>

        <VStack className="justify-center text-center text-sm text-gray-600 dark:text-gray-100 pt-6 border-t border-gray-700">
          <Text>{t("progressWith", { progress: progress.toFixed(1) })}</Text>
          <Text>{t("mistakesWith", { mistakes })}</Text>
          <Text>{t("speedWith", { speed: speed?.toFixed(2) })}</Text>
        </VStack>
      </VStack>
    </VStack>
  );
};
