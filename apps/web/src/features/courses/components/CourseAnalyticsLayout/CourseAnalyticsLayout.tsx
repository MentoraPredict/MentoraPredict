import { ReactNode, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

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
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="flex min-h-screen">
        {isSidebarVisible ? sidebar : null}

        <div className="flex min-h-screen flex-1 flex-col">
          <DashboardNavbar
            showLogo
            showWelcomeMessage={false}
            title={title}
            leadingAction={
              <button
                type="button"
                title={isSidebarVisible ? "Ocultar menu" : "Mostrar menu"}
                aria-label={isSidebarVisible ? "Ocultar menu" : "Mostrar menu"}
                onClick={() => {
                  setIsSidebarVisible((current) => !current);
                }}
                className="
                  inline-flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  text-gray-700
                  shadow-sm
                  transition
                  hover:bg-gray-50
                "
              >
                {isSidebarVisible ? <FiX size={18} /> : <FiMenu size={18} />}
              </button>
            }
          />

          <main className="flex-1 p-6">
            {children}
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
}
