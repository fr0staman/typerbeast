import { useQuery } from "@tanstack/react-query";
import { kyClient } from "./fetchWithAuth";

export type MeStats = {
  results_count: number;
  last_result: Record<string, string>;
  average_wpm: number;
  average_cpm: number;
  average_mistakes: number;
};

async function fetchUserStats(username: string): Promise<MeStats> {
  return await kyClient.get(`user/${username}/stats`).json();
}

export const useUserStats = (username: string) =>
  useQuery({
    queryKey: ["user-stats_" + username],
    queryFn: () => fetchUserStats(username),
  });
