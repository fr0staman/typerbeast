import { useQuery } from "@tanstack/react-query";
import { kyClient } from "./fetchWithAuth";
import { Dictionary } from "./useDictionaries";
import { User } from "../store/auth";

export type PendingText = {
  id: string;
  dictionary: Dictionary;
  author: User;
  title: string;
  content: string;
  created_at: string;
  reviewed_by: string;
  reviewed_at: string;
  status: string;
  reason: string;
};

type PendingTextsResponse = {
  list: PendingText[];
};

async function fetchPendingTexts(): Promise<PendingTextsResponse> {
  return await kyClient.get("texts/pending").json();
}

export const usePendingTexts = () => {
  return useQuery({
    queryKey: ["pending-texts"],
    queryFn: fetchPendingTexts,
  });
};
