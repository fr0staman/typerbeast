import { cookies } from "next/headers";
import { PUBLIC_API_URL } from "@/app/store/config";
import { User } from "../store/auth";

export const COOKIE_NAME = "typerbeast-api_token";

export async function getServerUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  const res = await fetch(PUBLIC_API_URL + "/user/me/profile", {
    headers: { Cookie: `${COOKIE_NAME}=${token}` },
  });

  if (!res.ok) return null;
  return (await res.json()) as User;
}
