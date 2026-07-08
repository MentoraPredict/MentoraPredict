import { MotionConfig } from "framer-motion";

import AppRouter from "@/routes/AppRouter";
import QueryProvider from "@/providers/QueryProvider";

export default function App() {
  return (
    <QueryProvider>
      <MotionConfig reducedMotion="user">
        <AppRouter />
      </MotionConfig>
    </QueryProvider>
  );
}
