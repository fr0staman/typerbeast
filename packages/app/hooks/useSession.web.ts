import { User } from "@/app/store/auth";
import { useQuery } from "@tanstack/react-query";
import { PUBLIC_API_URL } from "@/app/store/config";

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: checkProfile,
    retry: false,
    staleTime: Infinity,
  });
}

async function checkProfile(): Promise<User> {
  const res = await fetch(PUBLIC_API_URL + "/user/profile", {
    credentials: "include",
  });

  if (!res.ok) throw new Error("Not authenticated");

  return res.json();
}
