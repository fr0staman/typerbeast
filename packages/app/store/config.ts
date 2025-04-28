// @ts-expect-error Hardcoded babel path for react-native .env file.
import { API_URL } from "@env";

export const PUBLIC_API_URL: string = API_URL;
export const WEBSOCKET_API_URL: string = PUBLIC_API_URL.replace("http", "ws");
