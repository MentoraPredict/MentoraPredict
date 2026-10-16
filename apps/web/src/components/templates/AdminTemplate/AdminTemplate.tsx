import { ReactNode, useState } from "react";
import { FiMenu, FiX, FiBookOpen, FiUsers, FiCalendar, FiSettings, FiGrid, FiLayers } from "react-icons/fi";

import DashboardNavbar from "@/components/organisms/DashboardNavbar";
import DashboardSidebar from "@/components/organisms/DashboardSidebar";
import Footer from "@/components/organisms/Footer";
import { APP_PATHS } from "@/routes/paths";

interface AdminTemplateProps {
  children: ReactNode;
}

export default function AdminTemplate({ children }: AdminTemplateProps) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  const sections = [
    {
      items: [
        {
          label: "Usuarios",
          to: APP_PATHS.admin.users,
          icon: <FiUsers size={16} />,
        },
        {
          label: "Configuración",
          to: APP_PATHS.admin.institution,
          icon: <FiSettings size={16} />,
        },
        {
          label: "Años lectivos",
          to: APP_PATHS.admin.schoolYears,
          icon: <FiCalendar size={16} />,
        },
        {
          label: "Grados y paralelos",
          to: APP_PATHS.admin.structure,
          icon: <FiGrid size={16} />,
        },
        {
          label: "Asignaturas",
          to: APP_PATHS.admin.subjects,
          icon: <FiLayers size={16} />,
        },
        {
          label: "Cursos",
          to: APP_PATHS.admin.courses,
          icon: <FiBookOpen size={16} />,
        },
      ],
    },
  ];

  return (
    <div className="app-page min-h-screen bg-[var(--color-app-background)]">
      <div className="flex min-h-screen">
        {isSidebarVisible ? (
          <DashboardSidebar title="Panel administrativo" sections={sections} />
        ) : null}

        <div className="flex min-h-screen flex-1 flex-col">
          <DashboardNavbar
            title="Panel administrativo"
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

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
