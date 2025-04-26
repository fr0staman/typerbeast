import { useAuthStore, User } from "@/app/store/auth";
import { useQuery } from "@tanstack/react-query";
import { PUBLIC_API_URL } from "@/app/store/config";

export function useSession() {
  const token = useAuthStore(s => s.token);

  const query = useQuery({
    enabled: !!token,
    queryKey: ["session"],
    queryFn: async () => {
      if (!token) throw new Error("No token");
      return checkProfile(token);
    },
    retry: false,
  });

  return query;
}

async function checkProfile(token: string): Promise<User> {
  const res = await fetch(PUBLIC_API_URL + "/user/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Not authenticated");

  return res.json();
}
