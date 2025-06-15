import { Text, VStack } from "@/ui/components";

export const NotFound = () => {
  return (
    <VStack className="flex-1 items-center justify-center">
      <VStack className="w-full md:max-w-7xl items-center justify-center">
        <Text size="2xl">404</Text>
        <Text>Not found.</Text>
      </VStack>
    </VStack>
  );
};
