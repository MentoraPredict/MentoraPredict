import { ReactNode } from "react";

import DashboardNavbar from "@/components/organisms/DashboardNavbar";
import Footer from "@/components/organisms/Footer";

interface GuardianTemplateProps {
  children: ReactNode;
}

export default function GuardianTemplate({ children }: GuardianTemplateProps) {
  return (
    <div className="app-page">
      <DashboardNavbar />

      <main>{children}</main>

      <Footer />
    </div>
  );
}
