import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth";
import { kyClient } from "./fetchWithAuth";

export const useLogin = () => {
  const setToken = useAuthStore(s => s.setToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      try {
        return (await kyClient
          .post("user/login", {
            json: { email, password },
          })
          .json()) as { access_token: string };
      } catch {
        throw new Error("Login failed");
      }
    },
    onSuccess: ({ access_token }) => {
      setToken(access_token);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
