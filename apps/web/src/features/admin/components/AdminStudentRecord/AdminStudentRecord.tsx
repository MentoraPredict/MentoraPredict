import Badge from "@/components/atoms/Badge";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import StudentRecordGuardians from "@/features/admin/components/StudentRecordGuardians";
import StudentRecordProfileForm from "@/features/admin/components/StudentRecordProfileForm";
import useStudentRecord from "@/features/admin/hooks/useStudentRecord";
import {
  CONSENT_LABELS,
  type ConsentPurpose,
} from "@/types/academic/people-enrollment.types";

export type StudentRecordTab = "profile" | "guardians" | "consents";

interface AdminStudentRecordProps {
  studentId: string;
  tab: StudentRecordTab;
}

const SECTION_TITLES: Record<StudentRecordTab, string> = {
  profile: "Ficha del estudiante",
  guardians: "Representantes",
  consents: "Consentimientos",
};

/**
 * Contenido de la ficha de un estudiante. La pestaña la elige quien lo usa
 * (la vista del usuario); este componente solo carga y muestra los datos.
 */
export default function AdminStudentRecord({
  studentId,
  tab,
}: AdminStudentRecordProps) {
  const record = useStudentRecord(studentId);

  const activeConsents = new Set(
    record.consents.filter((c) => !c.revokedAt).map((c) => c.purpose)
  );

  return (
    <div className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6">
      <Heading as="h5" className="text-gray-900">
        {SECTION_TITLES[tab]}
      </Heading>

      {record.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text variant="small" className="font-medium text-red-700">
            {record.error}
          </Text>
        </div>
      ) : null}

      {record.isLoading ? (
        <Text variant="small" className="text-gray-600">
          Cargando...
        </Text>
      ) : null}

      {!record.isLoading && tab === "profile" && record.profile ? (
        <StudentRecordProfileForm
          profile={record.profile}
          isSaving={record.isSaving}
          isSaved={record.saved}
          onSave={(payload) => void record.saveProfile(payload)}
        />
      ) : null}

      {!record.isLoading && tab === "guardians" ? (
        <StudentRecordGuardians
          guardians={record.guardians}
          candidates={record.guardianCandidates}
          isSaving={record.isSaving}
          onSearch={(search) => void record.searchGuardians(search)}
          onLink={record.link}
          onUnlink={(guardianId) => void record.unlink(guardianId)}
        />
      ) : null}

      {!record.isLoading && tab === "consents" ? (
        <div className="space-y-3">
          <Text variant="caption" className="text-gray-600">
            Solo el representante puede otorgar o retirar estos consentimientos
            desde su portal.
          </Text>

          {(Object.keys(CONSENT_LABELS) as ConsentPurpose[]).map((purpose) => (
            <div
              key={purpose}
              className="flex items-start justify-between gap-3 rounded-xl border border-gray-200 px-4 py-3"
            >
              <div>
                <Text variant="small" className="font-medium text-gray-900">
                  {CONSENT_LABELS[purpose].title}
                </Text>
                <Text variant="caption" className="text-gray-500">
                  {CONSENT_LABELS[purpose].description}
                </Text>
              </div>
              <Badge tone={activeConsents.has(purpose) ? "green" : "amber"}>
                {activeConsents.has(purpose) ? "Otorgado" : "Pendiente"}
              </Badge>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}