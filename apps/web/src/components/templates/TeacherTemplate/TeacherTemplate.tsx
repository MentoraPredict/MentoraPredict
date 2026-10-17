import { ReactNode } from "react";

import DashboardNavbar from "@/components/organisms/DashboardNavbar";

interface TeacherTemplateProps {
  children: ReactNode;
}

export default function TeacherTemplate({ children }: TeacherTemplateProps) {
  return (
    <div className="app-page">
      <DashboardNavbar />

      <main>{children}</main>
    </div>
  );
}
