import { ReactNode } from "react";

import DashboardNavbar from "@/components/organisms/DashboardNavbar";
import Footer from "@/components/organisms/Footer";

interface TeacherTemplateProps {
  children: ReactNode;
}

export default function TeacherTemplate({ children }: TeacherTemplateProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <DashboardNavbar />

      <main>{children}</main>

      <Footer />
    </div>
  );
}
