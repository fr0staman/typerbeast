import { useQuery } from "@tanstack/react-query";
import { PUBLIC_API_URL } from "@/app/store/config";
import { fetchWithAuth } from "@/app/hooks/fetchWithAuth";

export type Dictionary = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
};

async function fetchRooms(): Promise<Dictionary[]> {
  const res = await fetchWithAuth(PUBLIC_API_URL + "/dictionaries");
  if (!res.ok) {
    throw new Error("Failed to fetch dictionaries");
  }
  const data = await res.json();
  return data.list; // assuming { list: [...] }
}

export const useDictionaries = () =>
  useQuery({
    queryKey: ["dictionaries"],
    queryFn: fetchRooms,
  });
