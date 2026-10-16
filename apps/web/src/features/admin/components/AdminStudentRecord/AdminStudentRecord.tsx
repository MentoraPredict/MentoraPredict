import { useState } from "react";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

import StudentRecordGuardians from "@/features/admin/components/StudentRecordGuardians";
import StudentRecordProfileForm from "@/features/admin/components/StudentRecordProfileForm";
import useStudentRecord from "@/features/admin/hooks/useStudentRecord";
import {
  CONSENT_LABELS,
  type ConsentPurpose,
} from "@/types/academic/people-enrollment.types";

interface AdminStudentRecordProps {
  studentId: string;
  studentName: string;
  onClose: () => void;
}

type Tab = "profile" | "guardians" | "consents";

const TABS: { id: Tab; label: string }[] = [
  { id: "profile", label: "Ficha" },
  { id: "guardians", label: "Representantes" },
  { id: "consents", label: "Consentimientos" },
];

export default function AdminStudentRecord({
  studentId,
  studentName,
  onClose,
}: AdminStudentRecordProps) {
  const record = useStudentRecord(studentId);
  const [tab, setTab] = useState<Tab>("profile");

  const activeConsents = new Set(
    record.consents.filter((c) => !c.revokedAt).map((c) => c.purpose)
  );

  return (
    <div className="max-h-[88vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Heading as="h4" className="text-gray-900">
            {studentName}
          </Heading>
          <Text variant="caption" className="mt-1 text-gray-600">
            Ficha del estudiante
          </Text>
        </div>
        <Button type="button" variant="outline" className="px-3 py-1.5 text-sm" onClick={onClose}>
          Cerrar
        </Button>
      </div>

      <div role="tablist" className="flex flex-wrap gap-2 border-b border-gray-200">
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
