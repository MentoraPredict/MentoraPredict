import { ReactNode } from "react";

import DashboardNavbar from "@/components/organisms/DashboardNavbar";
import Footer from "@/components/organisms/Footer";

interface StudentTemplateProps {
  children: ReactNode;
}

export default function StudentTemplate({ children }: StudentTemplateProps) {
  return (
    <div className="app-page">
      <DashboardNavbar />

      <main>{children}</main>

      <Footer />
    </div>
  );
}
