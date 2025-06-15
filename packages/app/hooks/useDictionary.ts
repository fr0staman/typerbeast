import { useQuery } from "@tanstack/react-query";
import { kyClient } from "./fetchWithAuth";
import { Dictionary } from "./useDictionaries";

export type Text = {
  id: string;
  dictionary_id: string;
  title: string;
  content: string;
  created_at: string;
};

type DictionaryAndTexts = {
  dictionary: Dictionary;
  list: Text[];
};

const fetchDictionary = async (
  dict_id: string,
): Promise<DictionaryAndTexts> => {
  return await kyClient.get(`dictionaries/${dict_id}/texts`).json();
};

export const useDictionary = (dict_id: string) => {
  return useQuery({
    queryKey: ["dictionary", dict_id],
    queryFn: () => fetchDictionary(dict_id),
  });
};
