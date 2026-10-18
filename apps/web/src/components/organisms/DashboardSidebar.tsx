import { ReactNode, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

import Text from "@/components/atoms/Text";
import LogoLink from "@/components/molecules/LogoLink";

export interface DashboardSidebarItem {
  label: string;
  to?: string;
  icon?: ReactNode;
  onClick?: () => void;
  /** Activo solo cuando la ruta coincide exactamente (no con sus subrutas). */
  end?: boolean;
  /** Se marca activo mientras la ruta esté bajo este prefijo (p. ej. todas las pestañas de una materia). */
  matchPrefix?: string;
  /** Ítems anidados — se renderizan como un submenú colapsable, expandido
   * automáticamente si la ruta activa coincide con alguno de sus hijos. */
  children?: DashboardSidebarItem[];
}

export interface DashboardSidebarSection {
  label?: string;
  items: DashboardSidebarItem[];
}

export type DashboardSidebarTheme = "dark" | "light";

interface DashboardSidebarProps {
  title?: string;
  sections: DashboardSidebarSection[];
  /** Slot fijo al final del sidebar (card de perfil, cerrar sesión, etc). */
  footer?: ReactNode;
  /** "dark" (default, comportamiento original) o "light" — fondo blanco con
   * acentos indigo, usado por el sidebar del estudiante. */
  theme?: DashboardSidebarTheme;
}

const itemBaseClassName = `
  relative
  flex
  w-full
  items-center
  gap-3
  rounded-xl
  px-4
  py-3
  text-left
  transition
`;

const themeStyles: Record<
  DashboardSidebarTheme,
  {
    aside: string;
    itemIdle: string;
    itemActive: string;
    idleText: string;
    activeText: string;
    accentBar: string | null;
    sectionLabel: string;
    submenuBorder: string;
    footerBorder: string;
    logoVariant: "default" | "light";
  }
> = {
  dark: {
    aside: "bg-blue-950 text-white",
    itemIdle: "text-white hover:bg-blue-800",
    itemActive: "bg-blue-700 text-white",
    idleText: "!text-white",
    activeText: "!text-white",
    accentBar: "bg-white/80",
    sectionLabel: "!text-white",
    submenuBorder: "border-white/10",
    footerBorder: "border-white/10",
    logoVariant: "light",
  },
  light: {
    aside: "bg-white text-gray-700 border-r border-gray-200",
    itemIdle: "text-gray-600 hover:bg-gray-50",
    itemActive: "bg-indigo-50 text-indigo-700 font-semibold",
    idleText: "!text-gray-600",
    activeText: "!text-indigo-700",
    accentBar: null,
    sectionLabel: "!text-gray-400",
    submenuBorder: "border-gray-200",
    footerBorder: "border-gray-200",
    logoVariant: "default",
  },
};

function isUnderPath(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function SidebarLeafItem({
  item,
  theme,
}: {
  item: DashboardSidebarItem;
  theme: DashboardSidebarTheme;
}) {
  const styles = themeStyles[theme];
  const { pathname } = useLocation();
  const matchesPrefix = item.matchPrefix
    ? isUnderPath(pathname, item.matchPrefix)
    : undefined;

  if (item.onClick) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        className={`${itemBaseClassName} ${styles.itemIdle}`}
      >
        {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
        <Text variant="caption" className={`font-medium ${styles.idleText}`}>
          {item.label}
        </Text>
      </button>
    );
  }

  return (
    <NavLink
      to={item.to ?? "#"}
      end={item.end}
      className={({ isActive }) =>
        `${itemBaseClassName} ${
          (matchesPrefix ?? isActive) ? styles.itemActive : styles.itemIdle
        }`
      }
    >
      {({ isActive: linkActive }) => {
        const isActive = matchesPrefix ?? linkActive;

        return (
        <>
          {isActive && styles.accentBar ? (
            <span
              className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full ${styles.accentBar}`}
            />
          ) : null}
          {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
          <Text
            variant="caption"
            className={`font-medium ${isActive ? styles.activeText : styles.idleText}`}
          >
            {item.label}
          </Text>
        </>
        );
      }}
    </NavLink>
  );
}

function SidebarNavItem({
  item,
  theme,
}: {
  item: DashboardSidebarItem;
  theme: DashboardSidebarTheme;
}) {
  const { pathname } = useLocation();
  const styles = themeStyles[theme];
  const hasActiveChild = !!item.children?.some((child) =>
    child.matchPrefix
      ? isUnderPath(pathname, child.matchPrefix)
      : child.to && pathname.startsWith(child.to)
  );
  const [isExpanded, setIsExpanded] = useState(hasActiveChild);

  if (!item.children || item.children.length === 0) {
    return <SidebarLeafItem item={item} theme={theme} />;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setIsExpanded((current) => !current);
        }}
        className={`${itemBaseClassName} justify-between ${styles.itemIdle}`}
      >
        <span className="flex items-center gap-3">
          {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
          <Text variant="caption" className={`font-medium ${styles.idleText}`}>
            {item.label}
          </Text>
        </span>
        {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
      </button>

      {isExpanded ? (
        <div className={`ml-4 mt-1 space-y-1 border-l pl-3 ${styles.submenuBorder}`}>
          {item.children.map((child) => (
            <SidebarLeafItem key={child.label} item={child} theme={theme} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function DashboardSidebar({
  title,
  sections,
  footer,
  theme = "dark",
}: DashboardSidebarProps) {
  const styles = themeStyles[theme];

  return (
    <aside
      className={`
        sticky
        top-0
        hidden
        flex-col
        h-screen
        w-64
        shrink-0
        md:flex
        ${styles.aside}
      `}
    >
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="mb-10">
          <LogoLink variant={styles.logoVariant} />

          {title ? (
            <Text
              variant="caption"
              className={`mt-1 uppercase tracking-[0.2em] ${styles.sectionLabel}`}
            >
              {title}
            </Text>
          ) : null}
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.label ?? section.items[0]?.to ?? section.items[0]?.label}>
              {section.label ? (
                <Text
                  variant="caption"
                  className={`mb-3 uppercase tracking-[0.18em] ${styles.sectionLabel}`}
                >
                  {section.label}
                </Text>
              ) : null}

              <nav className="space-y-2">
                {section.items.map((item) => (
                  <SidebarNavItem key={item.to ?? item.label} item={item} theme={theme} />
                ))}
              </nav>
            </section>
          ))}
        </div>
      </div>

      {footer ? (
        <div className={`shrink-0 border-t px-5 py-4 ${styles.footerBorder}`}>{footer}</div>
      ) : null}
    </aside>
  );
}
