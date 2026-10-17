import { ReactNode, useState } from "react";
import {
  FiAward,
  FiFileText,
  FiLock,
  FiAlertTriangle,
  FiMenu,
  FiX,
  FiBookOpen,
  FiUsers,
  FiCalendar,
  FiSettings,
  FiGrid,
  FiLayers,
  FiClipboard,
} from "react-icons/fi";

import DashboardNavbar from "@/components/organisms/DashboardNavbar";
import DashboardSidebar from "@/components/organisms/DashboardSidebar";
import { APP_PATHS } from "@/routes/paths";
import { useAuthStore } from "@/store/auth.store";
import type { UserRole } from "@/types/user/role.types";

const ADMIN_PANEL_TITLES: Record<UserRole, string> = {
  ADMIN: "Panel administrativo",
  SECRETARY: "Panel de secretaría",
  DECE: "Panel DECE",
  INSPECTOR: "Panel de inspección",
  TEACHER: "Panel docente",
  STUDENT: "Panel del estudiante",
  GUARDIAN: "Panel del representante",
};

interface AdminTemplateProps {
  children: ReactNode;
}

export default function AdminTemplate({ children }: AdminTemplateProps) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const role = useAuthStore((state) => state.user?.role);

  // Secretaría comparte este panel, pero solo ve lo que le corresponde.
  const allItems: {
    label: string;
    to: string;
    icon: ReactNode;
    roles: UserRole[];
  }[] = [
    {
      label: "Matrículas",
      to: APP_PATHS.admin.enrollments,
      icon: <FiClipboard size={16} />,
      roles: ["ADMIN", "SECRETARY"],
    },
    {
      label: "Alertas",
      to: APP_PATHS.admin.alerts,
      icon: <FiAlertTriangle size={16} />,
      roles: ["ADMIN", "INSPECTOR", "DECE"],
    },
    {
      label: "Justificaciones",
      to: APP_PATHS.admin.justifications,
      icon: <FiFileText size={16} />,
      roles: ["ADMIN", "INSPECTOR", "DECE"],
    },
    {
      label: "Cierre de periodos",
      to: APP_PATHS.admin.gradingPeriods,
      icon: <FiLock size={16} />,
      roles: ["ADMIN"],
    },
    {
      label: "Promoción",
      to: APP_PATHS.admin.promotion,
      icon: <FiAward size={16} />,
      roles: ["ADMIN"],
    },
    {
      label: "Usuarios",
      to: APP_PATHS.admin.users,
      icon: <FiUsers size={16} />,
      roles: ["ADMIN"],
    },
    {
      label: "Configuración",
      to: APP_PATHS.admin.institution,
      icon: <FiSettings size={16} />,
      roles: ["ADMIN"],
    },
    {
      label: "Años lectivos",
      to: APP_PATHS.admin.schoolYears,
      icon: <FiCalendar size={16} />,
      roles: ["ADMIN"],
    },
    {
      label: "Grados y paralelos",
      to: APP_PATHS.admin.structure,
      icon: <FiGrid size={16} />,
      roles: ["ADMIN"],
    },
    {
      label: "Asignaturas",
      to: APP_PATHS.admin.subjects,
      icon: <FiLayers size={16} />,
      roles: ["ADMIN"],
    },
    {
      label: "Cursos",
      to: APP_PATHS.admin.courses,
      icon: <FiBookOpen size={16} />,
      roles: ["ADMIN"],
    },
  ];

  // El rol del panel se indica solo en la barra lateral, junto al logo.
  const panelTitle = role ? ADMIN_PANEL_TITLES[role] : "Panel administrativo";

  const sections = [
    {
      items: allItems
        .filter((item) => !role || item.roles.includes(role))
        .map(({ label, to, icon }) => ({ label, to, icon })),
    },
  ];

  return (
    <div className="app-page min-h-screen bg-[var(--color-app-background)]">
      <div className="flex min-h-screen">
        {isSidebarVisible ? (
          <DashboardSidebar title={panelTitle} sections={sections} />
        ) : null}

        <div className="flex min-h-screen flex-1 flex-col">
          <DashboardNavbar
            logoOnlyOnMobile
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
    </div>
  );
}
