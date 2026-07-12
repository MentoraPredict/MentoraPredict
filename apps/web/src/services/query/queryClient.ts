import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { AxiosError } from "axios";

import { registerCreateCourseMutationDefaults } from "./createCourseMutation";

function shouldRetryQuery(failureCount: number, error: unknown) {
  // TanStack Query's own default (retry: 3, no status awareness) blindly
  // retries every failure, including 429s — piling more requests onto a
  // client the server just told to slow down, and turning one rate-limit
  // hit into a multi-request storm. No amount of retrying fixes a
  // 401/403/404/429 either. Only retry genuinely transient failures
  // (network errors, 5xx), up to 2 times.
  if (error instanceof AxiosError && error.response) {
    return false;
  }

  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false,
    },
    mutations: {
      networkMode: "online",
      retry: 0,
    },
  },
});

// Registered synchronously at module load, before any provider mounts, so
// resumePausedMutations() can rebuild paused mutations restored from
// localStorage after a cold reload (their original closures no longer exist).
registerCreateCourseMutationDefaults(queryClient);

export const queryPersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "mentorapredict-query-cache",
  throttleTime: 300,
});

export const QUERY_PERSIST_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;
