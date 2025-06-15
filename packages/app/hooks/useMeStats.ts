import { useQuery } from "@tanstack/react-query";
import { kyClient } from "./fetchWithAuth";

export type MeStats = {
  results_count: number;
  last_result: Record<string, string>;
  average_wpm: number;
  average_cpm: number;
  average_mistakes: number;
};

async function fetchMeStats(): Promise<MeStats> {
  return await kyClient.get("user/me/stats").json();
}

export const useMeStats = () =>
  useQuery({
    queryKey: ["me-stats"],
    queryFn: fetchMeStats,
  });
