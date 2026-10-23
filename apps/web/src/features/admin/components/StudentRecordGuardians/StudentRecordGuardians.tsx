import { useEffect, useState } from "react";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";

import {
  RELATION_LABELS,
  type GuardianLink,
  type GuardianRelation,
  type LinkGuardianPayload,
} from "@/types/academic/people-enrollment.types";
import type { AppUser } from "@/types/user/user.types";

interface StudentRecordGuardiansProps {
  guardians: GuardianLink[];
  candidates: AppUser[];
  isSaving: boolean;
  onSearch: (search: string) => void;
  onLink: (payload: LinkGuardianPayload) => Promise<boolean>;
  onUnlink: (guardianId: string) => void;
}

function displayName(user: AppUser) {
  return [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email;
}

export default function StudentRecordGuardians({
  guardians,
  candidates,
  isSaving,
  onSearch,
  onLink,
  onUnlink,
}: StudentRecordGuardiansProps) {
  const [search, setSearch] = useState("");
  const [guardianId, setGuardianId] = useState("");
  const [relation, setRelation] = useState<GuardianRelation>("MOTHER");
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => onSearch(search), 300);

    return () => clearTimeout(timer);
  }, [search, onSearch]);

  const linkedIds = new Set(guardians.map((g) => g.guardianId));

  const handleLink = async () => {
    if (!guardianId) return;

    const ok = await onLink({ guardianId, relation, isPrimary });

    if (ok) {
      setGuardianId("");
      setIsPrimary(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
        {guardians.map((link) => (
          <div key={link.guardianId} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <div className="min-w-[10rem] flex-1">
              <Text variant="small" className="font-medium text-gray-900">
                {link.guardianName}
              </Text>
              <Text variant="caption" className="text-gray-500">
                {RELATION_LABELS[link.relation]}
                {link.canPickup ? " · puede retirar" : ""}
              </Text>
            </div>
            {link.isPrimary ? <Badge tone="green">Principal</Badge> : null}
            <Button
              type="button"
              variant="outline"
              className="px-3 py-1.5 text-sm"
              disabled={isSaving}
              onClick={() => onUnlink(link.guardianId)}
            >
              Desvincular
            </Button>
          </div>
        ))}
        {guardians.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <Text variant="small" className="text-gray-600">
              Este estudiante aún no tiene representantes vinculados.
            </Text>
          </div>
        ) : null}
      </div>

      <div className="space-y-3 rounded-xl border border-gray-200 p-4">
        <Text variant="small" className="font-medium text-gray-900">
          Vincular representante
        </Text>

        <Input
          aria-label="Buscar representante"
          placeholder="Buscar por nombre o correo"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="guardian-select">Representante</Label>
            <Select
              id="guardian-select"
              value={guardianId}
              onChange={(e) => setGuardianId(e.target.value)}
            >
              <option value="">Selecciona</option>
              {candidates
                .filter((user) => !linkedIds.has(user.id))
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {displayName(user)}
                  </option>
                ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="guardian-relation">Parentesco</Label>
            <Select
              id="guardian-relation"
              value={relation}
              onChange={(e) => setRelation(e.target.value as GuardianRelation)}
            >
              {Object.entries(RELATION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
          />
          Es el representante principal
        </label>

        <div className="flex justify-end">
          <Button
            type="button"
            isLoading={isSaving}
            disabled={!guardianId}
            onClick={() => void handleLink()}
          >
            Vincular
          </Button>
        </div>
      </div>
    </div>
  );
}
