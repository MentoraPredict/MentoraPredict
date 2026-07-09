import { MotionConfig } from "framer-motion";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";

import AppRouter from "@/routes/AppRouter";
import {
  queryClient,
  queryPersister,
  QUERY_PERSIST_MAX_AGE_MS,
} from "@/services/query/queryClient";

export default function App() {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: queryPersister, maxAge: QUERY_PERSIST_MAX_AGE_MS }}
      onSuccess={() => {
        void queryClient.resumePausedMutations();
      }}
    >
      <MotionConfig reducedMotion="user">
        <AppRouter />
      </MotionConfig>
    </PersistQueryClientProvider>
  );
}
