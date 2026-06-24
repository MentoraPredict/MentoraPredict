import { ReactNode } from "react";

import { AuthHero } from "@/features/auth/components";

interface AuthTemplateProps {
  children: ReactNode;
}

export default function AuthTemplate({ children }: AuthTemplateProps) {
  return (
    <main
      className="
                min-h-screen
                grid
                lg:grid-cols-2
            "
    >
      <AuthHero />

      {children}
    </main>
  );
}
