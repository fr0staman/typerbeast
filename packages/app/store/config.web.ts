const saved_api_url = process.env.ON_SERVER_API_URL;

const runsOnServerSide = typeof window === "undefined";

if (runsOnServerSide && !saved_api_url) {
  throw Error("ON_SERVER_API_URL is not defined");
}

export const PUBLIC_API_URL: string = runsOnServerSide
  ? saved_api_url || "/"
  : "/api";

export const WEBSOCKET_API_URL: string = runsOnServerSide
  ? PUBLIC_API_URL.replace("http", "ws")
  : `wss://${window.location.hostname}:${window.location.port}/api`;
