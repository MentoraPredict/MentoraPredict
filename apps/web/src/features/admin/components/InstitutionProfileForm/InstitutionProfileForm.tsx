import { useState } from "react";

import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";

import AdminConfigSection from "@/features/admin/components/AdminConfigSection";
import {
  SUSTENTATION_LABELS,
  type Institution,
  type Sustentation,
} from "@/types/academic/institution-config.types";
import {
  REGIME_LABELS,
  type SchoolRegime,
} from "@/types/academic/school-year.types";

interface InstitutionProfileFormProps {
  institution: Institution;
  isSaving: boolean;
  isSaved: boolean;
  errorMessage?: string | null;
  onSave: (payload: Omit<Institution, "id">) => void;
}

type TextField =
  | "amie"
  | "name"
  | "zone"
  | "district"
  | "address"
  | "phone"
  | "email"
  | "rectorName";

const TEXT_FIELDS: { key: TextField; label: string; placeholder?: string }[] = [
  { key: "name", label: "Nombre de la institución" },
  { key: "amie", label: "Código AMIE", placeholder: "17H00001" },
  { key: "rectorName", label: "Rector o rectora" },
  { key: "zone", label: "Zona" },
  { key: "district", label: "Distrito" },
  { key: "address", label: "Dirección" },
  { key: "phone", label: "Teléfono" },
  { key: "email", label: "Correo institucional" },
];

export default function InstitutionProfileForm({
  institution,
  isSaving,
  isSaved,
  errorMessage,
  onSave,
}: InstitutionProfileFormProps) {
  const [form, setForm] = useState({
    ...institution,
    amie: institution.amie ?? "",
    zone: institution.zone ?? "",
    district: institution.district ?? "",
    address: institution.address ?? "",
    phone: institution.phone ?? "",
    email: institution.email ?? "",
    rectorName: institution.rectorName ?? "",
    logoUrl: institution.logoUrl ?? "",
  });

  const setField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    const { id: _id, ...rest } = form;
    void _id;

    onSave({
      ...rest,
      amie: rest.amie || null,
      zone: rest.zone || null,
      district: rest.district || null,
      address: rest.address || null,
      phone: rest.phone || null,
      email: rest.email || null,
      rectorName: rest.rectorName || null,
      logoUrl: rest.logoUrl || null,
    });
  };

  return (
    <AdminConfigSection
      title="Datos de la institución"
      description="Identifica a la institución y define su sostenimiento y régimen, que determinan el calendario escolar."
      isSaving={isSaving}
      isSaved={isSaved}
      errorMessage={errorMessage}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {TEXT_FIELDS.map(({ key, label, placeholder }) => (
          <div key={key}>
            <Label htmlFor={`institution-${key}`}>{label}</Label>
            <Input
              id={`institution-${key}`}
              placeholder={placeholder}
              value={form[key]}
              onChange={(e) => setField(key, e.target.value)}
            />
          </div>
        ))}

        <div>
          <Label htmlFor="institution-sustentation">Sostenimiento</Label>
          <Select
            id="institution-sustentation"
            value={form.sustentation}
            onChange={(e) =>
              setForm((c) => ({
                ...c,
                sustentation: e.target.value as Sustentation,
              }))
            }
          >
            {Object.entries(SUSTENTATION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="institution-regime">Régimen escolar</Label>
          <Select
            id="institution-regime"
            value={form.regime}
            onChange={(e) =>
              setForm((c) => ({
                ...c,
                regime: e.target.value as SchoolRegime,
              }))
            }
          >
            {Object.entries(REGIME_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </AdminConfigSection>
  );
}
