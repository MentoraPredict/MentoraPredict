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
  /** Ítems anidados — se renderizan como un submenú colapsable, expandido
   * automáticamente si la ruta activa coincide con alguno de sus hijos. */
  children?: DashboardSidebarItem[];
}

export interface DashboardSidebarSection {
  label?: string;
  items: DashboardSidebarItem[];
}

interface DashboardSidebarProps {
  title: string;
  sections: DashboardSidebarSection[];
  /** Slot fijo al final del sidebar (card de perfil, cerrar sesión, etc). */
  footer?: ReactNode;
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

function SidebarLeafItem({ item }: { item: DashboardSidebarItem }) {
  if (item.onClick) {
    return (
      <button
        type="button"
        onClick={item.onClick}
        className={`${itemBaseClassName} text-white hover:bg-blue-800`}
      >
        {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
        <Text variant="caption" className="font-medium !text-white">
          {item.label}
        </Text>
      </button>
    );
  }

  return (
    <NavLink
      to={item.to ?? "#"}
      className={({ isActive }) =>
        `${itemBaseClassName} ${isActive ? "bg-blue-700 text-white" : "text-white hover:bg-blue-800"}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive ? (
            <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white/80" />
          ) : null}
          {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
          <Text variant="caption" className="font-medium !text-white">
            {item.label}
          </Text>
        </>
      )}
    </NavLink>
  );
}

function SidebarNavItem({ item }: { item: DashboardSidebarItem }) {
  const { pathname } = useLocation();
  const hasActiveChild = !!item.children?.some(
    (child) => child.to && pathname.startsWith(child.to)
  );
  const [isExpanded, setIsExpanded] = useState(hasActiveChild);

  if (!item.children || item.children.length === 0) {
    return <SidebarLeafItem item={item} />;
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setIsExpanded((current) => !current);
        }}
        className={`${itemBaseClassName} justify-between text-white hover:bg-blue-800`}
      >
        <span className="flex items-center gap-3">
          {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
          <Text variant="caption" className="font-medium !text-white">
            {item.label}
          </Text>
        </span>
        {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
      </button>

      {isExpanded ? (
        <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-3">
          {item.children.map((child) => (
            <SidebarLeafItem key={child.label} item={child} />
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
}: DashboardSidebarProps) {
  return (
    <aside
      className="
        sticky
        top-0
        hidden
        flex-col
        h-screen
        w-64
        shrink-0
        bg-blue-950
        text-white
        md:flex
      "
    >
      <div className="flex-1 overflow-y-auto px-5 py-6">
        <div className="mb-10">
          <LogoLink variant="light" />

          <Text
            variant="caption"
            className="mt-1 uppercase tracking-[0.2em] text-white"
          >
            {title}
          </Text>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.label ?? section.items[0]?.to ?? section.items[0]?.label}>
              {section.label ? (
                <Text
                  variant="caption"
                  className="mb-3 uppercase tracking-[0.18em] text-white"
                >
                  {section.label}
                </Text>
              ) : null}

              <nav className="space-y-2">
                {section.items.map((item) => (
                  <SidebarNavItem key={item.to ?? item.label} item={item} />
                ))}
              </nav>
            </section>
          ))}
        </div>
      </div>

      {footer ? (
        <div className="shrink-0 border-t border-white/10 px-5 py-4">{footer}</div>
      ) : null}
    </aside>
  );
}
