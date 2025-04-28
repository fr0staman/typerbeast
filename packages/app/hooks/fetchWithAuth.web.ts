export async function fetchWithAuth(
  ...args: Parameters<typeof fetch>
): ReturnType<typeof fetch> {
  return fetch(args[0], {
    ...args[1],
    credentials: "include",
  });
}
