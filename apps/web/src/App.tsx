import { MotionConfig } from "framer-motion";

import AppRouter from "@/routes/AppRouter";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AppRouter />
    </MotionConfig>
  );
}
