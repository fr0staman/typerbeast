import { useQuery } from "@tanstack/react-query";
import { kyClient } from "@/app/hooks/fetchWithAuth";

export type Dictionary = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
};

type DictionaryResponse = {
  list: Dictionary[];
};
async function fetchRooms(): Promise<DictionaryResponse> {
  return await kyClient.get("dictionaries").json();
}

export const useDictionaries = () =>
  useQuery({
    queryKey: ["dictionaries"],
    queryFn: fetchRooms,
  });
