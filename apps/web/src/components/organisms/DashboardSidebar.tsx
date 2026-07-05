import { ReactNode } from "react";
import { NavLink } from "react-router-dom";

import Text from "@/components/atoms/Text";
import LogoLink from "@/components/molecules/LogoLink";

export interface DashboardSidebarItem {
  label: string;
  to: string;
  icon?: ReactNode;
}

export interface DashboardSidebarSection {
  label?: string;
  items: DashboardSidebarItem[];
}

interface DashboardSidebarProps {
  title: string;
  sections: DashboardSidebarSection[];
}

export default function DashboardSidebar({
  title,
  sections,
}: DashboardSidebarProps) {
  return (
    <aside
      className="
        sticky
        top-0
        hidden
        h-screen
        w-64
        shrink-0
        overflow-y-auto
        bg-blue-950
        px-5
        py-6
        text-white
        md:block
      "
    >
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
          <section key={section.label ?? section.items[0]?.to}>
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
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      px-4
                      py-3
                      transition
                      ${isActive ? "bg-blue-700 text-white" : "text-white hover:bg-blue-800"}
                    `
                  }
                >
                  {item.icon ? <span className="shrink-0">{item.icon}</span> : null}

                  <Text variant="caption" className="font-medium !text-white">
                    {item.label}
                  </Text>
                </NavLink>
              ))}
            </nav>
          </section>
        ))}
      </div>
    </aside>
  );
}
