import { ReactNode } from "react";

import DashboardNavbar from "@/components/organisms/DashboardNavbar";
import Footer from "@/components/organisms/Footer";
import { APP_PATHS } from "@/routes/paths";

interface AdminTemplateProps {
  children: ReactNode;
}

const adminNavItems = [
  {
    label: "Usuarios",
    to: APP_PATHS.admin.users,
  },
  {
    label: "Cursos",
    to: APP_PATHS.admin.courses,
  },
];

export default function AdminTemplate({ children }: AdminTemplateProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <DashboardNavbar navItems={adminNavItems} />

      <main>{children}</main>

      <Footer />
    </div>
  );
}
