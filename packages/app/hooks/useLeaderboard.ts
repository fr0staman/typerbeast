import { useQuery } from "@tanstack/react-query";
import { kyClient } from "./fetchWithAuth";

type LeaderboardResponse = {
  users: TopUser[];
};

export type TopUser = {
  user_id: string;
  username: string;
  room_id: string;
  id: string;
  wpm: number;
  cpm: number;
  mistakes: number;
  achieved_at: string;
};

type Params = {
  dictionary_id?: string;
  league?: string;
  period?: string;
};

async function fetchLeaderboard(
  dict?: string,
  league?: string,
  period?: string,
): Promise<LeaderboardResponse> {
  const searchParams = {} as Params;

  if (dict) {
    searchParams.dictionary_id = dict;
  }

  if (league) {
    searchParams.league = league.toLowerCase();
  }

  if (period) {
    searchParams.period = period.toLowerCase();
  }

  return await kyClient
    .get("leaderboard", {
      searchParams,
    })
    .json();
}
export const useLeaderboard = (
  dict?: string,
  league?: string,
  period?: string,
) =>
  useQuery({
    queryKey: ["top", dict, league, period],
    queryFn: () => fetchLeaderboard(dict, league, period),
  });
