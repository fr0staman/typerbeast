import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "./fetchWithAuth";
import { PUBLIC_API_URL } from "../store/config";
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
  const res = await fetchWithAuth(
    PUBLIC_API_URL + `/dictionaries/${dict_id}/texts`,
  );
  if (!res.ok) {
    throw new Error("Failed to fetch dictionary ");
  }
  const data = await res.json();
  return data; // assuming { list: [...] }
};

export const useDictionary = (dict_id: string) => {
  return useQuery({
    queryKey: ["dictionary", dict_id],
    queryFn: () => fetchDictionary(dict_id),
  });
};
