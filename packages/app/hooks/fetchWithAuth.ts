import { useAuthStore } from "@/app/store/auth";

export async function fetchWithAuth(
  ...args: Parameters<typeof fetch>
): ReturnType<typeof fetch> {
  const token = useAuthStore.getState().token;
  return fetch(args[0], {
    ...args[1],
    headers: {
      ...args[1]?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}
