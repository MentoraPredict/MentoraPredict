import { useState } from "react";

import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import AdminTemplate from "@/components/templates/AdminTemplate";
import AdminAttendanceFollowUp from "@/features/admin/components/AdminAttendanceFollowUp";

type AlertsTab = "attendance";

// Cada tipo de alerta es una pestaña; las nuevas se agregan aquí.
const TABS: { id: AlertsTab; label: string }[] = [
  { id: "attendance", label: "Seguimiento de asistencia" },
];

export default function AdminAlertsPage() {
  const [tab, setTab] = useState<AlertsTab>("attendance");

  return (
    <AdminTemplate>
      <Container className="pt-8">
        <Heading as="h3" className="text-gray-900">
          Alertas
        </Heading>
        <Text variant="small" className="mt-1 text-gray-600">
          Situaciones que requieren seguimiento del personal.
        </Text>

        <div
          role="tablist"
          className="mt-4 flex flex-wrap gap-2 border-b border-gray-200"
        >
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
                tab === item.id
                  ? "border-blue-700 text-blue-700"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Container>

      {tab === "attendance" ? <AdminAttendanceFollowUp /> : null}
    </AdminTemplate>
  );
}