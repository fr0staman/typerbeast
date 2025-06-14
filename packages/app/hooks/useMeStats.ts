import { useQuery } from "@tanstack/react-query";
import { PUBLIC_API_URL } from "../store/config";
import { fetchWithAuth } from "./fetchWithAuth";

export type MeStats = {
  results_count: number;
  last_result: Record<string, string>;
  average_wpm: number;
  average_cpm: number;
  average_mistakes: number;
};

async function fetchMeStats(): Promise<MeStats> {
  const res = await fetchWithAuth(PUBLIC_API_URL + "/user/me/stats");
  if (!res.ok) {
    throw new Error("Failed to fetch stats");
  }
  const data = await res.json();
  return data;
}

export const useMeStats = () =>
  useQuery({
    queryKey: ["me-stats"],
    queryFn: fetchMeStats,
  });
