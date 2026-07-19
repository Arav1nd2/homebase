import { QueryClient, isServer } from "@tanstack/react-query";
import { cache } from "react";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

// Per-request memoization on the server (React.cache) avoids each server
// component that calls getQueryClient() during the same render getting its
// own disconnected cache; a plain module singleton on the server would leak
// across concurrent requests instead (research.md §6).
const getServerQueryClient = cache(makeQueryClient);

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (isServer) {
    return getServerQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}
