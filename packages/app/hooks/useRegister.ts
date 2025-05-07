import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PUBLIC_API_URL } from "@/app/store/config";

type RegisterResponse = {
  access_token: string;
  token_type: string;
};

type RegisterRequest = {
  email: string;
  password: string;
  username: string;
};

export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      username,
    }: RegisterRequest): Promise<RegisterResponse> => {
      const response = await fetch(PUBLIC_API_URL + "/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username }),
      });

      if (!response.ok) throw new Error("Registration failed");

      return response.json();
    },
    onSuccess: () => {
      // Update the query client with the new user data
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
