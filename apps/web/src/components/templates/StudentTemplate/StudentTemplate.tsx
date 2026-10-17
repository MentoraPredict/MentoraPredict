import { ReactNode } from "react";

import DashboardNavbar from "@/components/organisms/DashboardNavbar";

interface StudentTemplateProps {
  children: ReactNode;
}

export default function StudentTemplate({ children }: StudentTemplateProps) {
  return (
    <div className="app-page">
      <DashboardNavbar />

      <main>{children}</main>
    </div>
  );
}
