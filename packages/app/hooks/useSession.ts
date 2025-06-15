import { User } from "@/app/store/auth";
import { useQuery } from "@tanstack/react-query";
import { kyClient } from "@/app/hooks/fetchWithAuth";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: checkProfile,
    retry: false,
    staleTime: Infinity,
  });
}

async function checkProfile(): Promise<User> {
  return await kyClient.get("user/me/profile").json();
}
