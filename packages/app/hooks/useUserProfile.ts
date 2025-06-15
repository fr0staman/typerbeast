import { useQuery } from "@tanstack/react-query";
import { kyClient } from "./fetchWithAuth";
import { User } from "../store/auth";

export type UserProfile = Omit<User, "id" | "email">;

async function fetchUserProfile(username: string): Promise<UserProfile> {
  return await kyClient.get(`user/${username}/profile`).json();
}

export const useUserProfile = (username: string) =>
  useQuery({
    queryKey: ["user-profile_" + username],
    queryFn: () => fetchUserProfile(username),
  });
