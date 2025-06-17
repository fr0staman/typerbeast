import { useMutation } from "@tanstack/react-query";
import { kyClient } from "./fetchWithAuth";
import { User } from "../store/auth";

async function patchUser(username: string, user: Partial<User>) {
  return await kyClient.patch(`user/${username}`, { json: user }).json();
}

export const useMutateUser = (username: string) => {
  return useMutation({
    mutationFn: async (user: Partial<User>) => await patchUser(username, user),
    mutationKey: [`user-${username}`],
  });
};
