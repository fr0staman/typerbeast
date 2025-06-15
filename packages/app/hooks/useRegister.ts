import { useMutation, useQueryClient } from "@tanstack/react-query";
import { kyClient } from "./fetchWithAuth";

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
      try {
        return await kyClient
          .post("user/signup", {
            json: { email, password, username },
          })
          .json();
      } catch {
        throw new Error("Registration failed");
      }
    },
    onSuccess: () => {
      // Update the query client with the new user data
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
