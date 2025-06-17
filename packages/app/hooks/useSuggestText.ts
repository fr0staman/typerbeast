import { useMutation } from "@tanstack/react-query";
import { Text } from "./useDictionary";
import { kyClient } from "./fetchWithAuth";

async function postSuggestText({
  dictionary_id,
  title,
  content,
}: Partial<Text>) {
  return await kyClient.post(`texts`, {
    json: { title, content, dictionary_id },
  });
}

export const useSuggestText = () => {
  return useMutation({
    mutationFn: postSuggestText,
  });
};
