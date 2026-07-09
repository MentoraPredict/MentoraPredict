import { QueryClient } from "@tanstack/react-query";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

import { registerCreateCourseMutationDefaults } from "./createCourseMutation";

export const queryClient = new QueryClient({
  defaultOptions: {
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
