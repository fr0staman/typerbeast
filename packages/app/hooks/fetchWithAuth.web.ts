import ky from "ky";
import { PUBLIC_API_URL } from "../store/config";

export const kyClient = ky.create({
  prefixUrl: PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  throwHttpErrors: true,
});
