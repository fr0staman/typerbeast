import { useAuthStore } from "@/app/store/auth";
import ky from "ky";
import { PUBLIC_API_URL } from "../store/config";

export const kyClient = ky.create({
  prefixUrl: PUBLIC_API_URL,
  hooks: {
    beforeRequest: [
      request => {
        const token = useAuthStore.getState().token;
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
  },
  headers: {
    "Content-Type": "application/json",
  },
  throwHttpErrors: true,
});
