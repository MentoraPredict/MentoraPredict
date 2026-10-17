import { useState } from "react";

import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import AttendanceRuleForm from "@/features/admin/components/AttendanceRuleForm";
import GradingComponentsForm from "@/features/admin/components/GradingComponentsForm";
import GradingScaleForm from "@/features/admin/components/GradingScaleForm";
import InstitutionLevelsForm from "@/features/admin/components/InstitutionLevelsForm";
import InstitutionProfileForm from "@/features/admin/components/InstitutionProfileForm";
import PromotionRulesForm from "@/features/admin/components/PromotionRulesForm";
import useInstitutionConfig, {
  type ConfigSection,
} from "@/features/admin/hooks/useInstitutionConfig";

const TABS: { id: ConfigSection; label: string }[] = [
  { id: "institution", label: "Institución" },
  { id: "levels", label: "Niveles y jornadas" },
  { id: "gradingScale", label: "Escala de calificaciones" },
  { id: "gradingComponents", label: "Componentes de la nota" },
  { id: "attendance", label: "Asistencia" },
  { id: "promotion", label: "Promoción" },
];

export default function AdminInstitutionConfig() {
  const {
    config,
    components,
    isLoading,
    loadError,
    savingSection,
    sectionError,
    savedSection,
    saveInstitution,
    saveLevels,
    saveGradingScale,
    saveComponents,
    saveAttendanceRule,
    savePromotionRules,
  } = useInstitutionConfig();
  const [activeTab, setActiveTab] = useState<ConfigSection>("institution");

  const sectionProps = (section: ConfigSection) => ({
    isSaving: savingSection === section,
    isSaved: savedSection === section,
    errorMessage: sectionError?.section === section ? sectionError.message : null,
  });

  return (
    <Container className="py-8">
      <div className="mb-6">
        <Heading as="h3" className="text-gray-900">
          Configuración institucional
        </Heading>
        <Text variant="small" className="mt-1 text-gray-600">
          Parámetros normativos de la institución. Los demás módulos leen estos
          valores, así que se pueden ajustar sin modificar el sistema.
        </Text>
      </div>

      {loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text variant="small" className="font-medium text-red-700">
            {loadError}
          </Text>
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small">Cargando...</Text>
        </div>
      ) : null}

      {config ? (
        <>
          <div
            role="tablist"
            className="mb-5 flex flex-wrap gap-2 border-b border-gray-200"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "border-blue-700 text-blue-700"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "institution" ? (
            <InstitutionProfileForm
              institution={config.institution}
              onSave={(payload) => void saveInstitution(payload)}
              {...sectionProps("institution")}
            />
          ) : null}

          {activeTab === "levels" ? (
            <InstitutionLevelsForm
              catalog={config.levelCatalog}
              levels={config.levels}
              onSave={(levels) => void saveLevels(levels)}
              {...sectionProps("levels")}
            />
          ) : null}

          {activeTab === "gradingScale" ? (
            <GradingScaleForm
              scale={config.gradingScale}
              onSave={(payload) => void saveGradingScale(payload)}
              {...sectionProps("gradingScale")}
            />
          ) : null}

          {activeTab === "gradingComponents" ? (
            <GradingComponentsForm
              components={components}
              onSave={(items) => void saveComponents(items)}
              {...sectionProps("gradingComponents")}
            />
          ) : null}

          {activeTab === "attendance" ? (
            <AttendanceRuleForm
              rule={config.attendanceRule}
              catalog={config.levelCatalog}
              onSave={(payload) => void saveAttendanceRule(payload)}
              {...sectionProps("attendance")}
            />
          ) : null}

          {activeTab === "promotion" ? (
            <PromotionRulesForm
              catalog={config.levelCatalog}
              rules={config.promotionRules}
              onSave={(rules) => void savePromotionRules(rules)}
              {...sectionProps("promotion")}
            />
          ) : null}
        </>
      ) : null}
    </Container>
  );
}
