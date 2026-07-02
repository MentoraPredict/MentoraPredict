import { ReactNode } from "react";

import DashboardNavbar from "@/components/organisms/DashboardNavbar";
import Footer from "@/components/organisms/Footer";

interface CourseAnalyticsLayoutProps {
  title: string;
  sidebar: ReactNode;
  children: ReactNode;
}

export default function CourseAnalyticsLayout({
  title,
  sidebar,
  children,
}: CourseAnalyticsLayoutProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex min-h-screen">
        {sidebar}

        <div className="flex min-h-screen flex-1 flex-col">
          <DashboardNavbar
            showLogo={false}
            showWelcomeMessage={false}
            title={title}
          />

          <main className="flex-1 p-6">{children}</main>

          <Footer />
        </div>
      </div>
    </div>
  );
}
