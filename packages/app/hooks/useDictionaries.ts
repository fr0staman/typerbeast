import { useQuery } from "@tanstack/react-query";
import { kyClient } from "@/app/hooks/fetchWithAuth";
import { UserProfile } from "./useUserProfile";

export type Dictionary = {
  id: string;
  name: string;
  user: UserProfile;
  created_at: string;
  text_count: number;
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
