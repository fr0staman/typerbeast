import { useQuery } from "@tanstack/react-query";
import { PUBLIC_API_URL } from "../store/config";
import { fetchWithAuth } from "./fetchWithAuth";
import { User } from "../store/auth";

export type UserProfile = Omit<User, "id" | "email">;

async function fetchUserProfile(username: string): Promise<UserProfile> {
  const res = await fetchWithAuth(PUBLIC_API_URL + `/user/${username}/profile`);

  //if (!res.ok) throw new Error("Not authenticated");
  const data = await res.json();

  return data;
}

export const useUserProfile = (username: string) =>
  useQuery({
    queryKey: ["user-profile_" + username],
    queryFn: () => fetchUserProfile(username),
  });
