import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/auth";
import { PUBLIC_API_URL } from "../store/config";

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
      const res = await fetch(PUBLIC_API_URL + "/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error("Login failed");
      return res.json();
    },
    onSuccess: ({ access_token }) => {
      setToken(access_token);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
