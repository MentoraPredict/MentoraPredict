import { ReactNode } from "react";

import AdminNavbar from "@/components/organisms/AdminNavbar";
import Footer from "@/components/organisms/Footer";

interface AdminTemplateProps {
  children: ReactNode;
}

export default function AdminTemplate({ children }: AdminTemplateProps) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNavbar />

      <main>{children}</main>

      <Footer />
    </div>
  );
}
