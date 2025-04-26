const saved_api_url = process.env.ON_SERVER_API_URL;

const runsOnServerSide = typeof window === "undefined";

if (runsOnServerSide && !saved_api_url) {
  throw Error("NEXT_PUBLIC_API_URL is not defined");
}

export const PUBLIC_API_URL: string = runsOnServerSide
  ? saved_api_url || "/"
  : "/api";
