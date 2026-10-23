import { useState } from "react";

import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";
import Textarea from "@/components/atoms/Textarea";

import type {
  Sex,
  StudentProfile,
  StudentProfilePayload,
} from "@/types/academic/people-enrollment.types";

interface StudentRecordProfileFormProps {
  profile: StudentProfile;
  isSaving: boolean;
  isSaved: boolean;
  onSave: (payload: StudentProfilePayload) => void;
}

const SEX_LABELS: Record<Sex, string> = {
  F: "Femenino",
  M: "Masculino",
  X: "Otro / No especifica",
};

export default function StudentRecordProfileForm({
  profile,
  isSaving,
  isSaved,
  onSave,
}: StudentRecordProfileFormProps) {
  const [birthDate, setBirthDate] = useState(profile.birthDate ?? "");
  const [sex, setSex] = useState<Sex | "">(profile.sex ?? "");
  const [nationality, setNationality] = useState(profile.nationality ?? "");
  const [address, setAddress] = useState(profile.address ?? "");
  const [previousSchool, setPreviousSchool] = useState(profile.previousSchool ?? "");
  const [contactName, setContactName] = useState(profile.emergencyContactName ?? "");
  const [contactPhone, setContactPhone] = useState(profile.emergencyContactPhone ?? "");
  const [hasNee, setHasNee] = useState(profile.hasSpecialNeeds);
  const [neeNotes, setNeeNotes] = useState(profile.specialNeedsNotes ?? "");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    onSave({
      birthDate: birthDate || null,
      sex: sex || null,
      nationality: nationality || null,
      address: address || null,
      previousSchool: previousSchool || null,
      emergencyContactName: contactName || null,
      emergencyContactPhone: contactPhone || null,
      hasSpecialNeeds: hasNee,
      specialNeedsNotes: hasNee ? neeNotes || null : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="rec-birth">Fecha de nacimiento</Label>
          <Input
            id="rec-birth"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="rec-sex">Sexo</Label>
          <Select id="rec-sex" value={sex} onChange={(e) => setSex(e.target.value as Sex | "")}>
            <option value="">No registrado</option>
            {Object.entries(SEX_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="rec-nationality">Nacionalidad</Label>
          <Input
            id="rec-nationality"
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="rec-previous">Institución de procedencia</Label>
          <Input
            id="rec-previous"
            value={previousSchool}
            onChange={(e) => setPreviousSchool(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="rec-address">Dirección</Label>
          <Input
            id="rec-address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="rec-contact-name">Contacto de emergencia</Label>
          <Input
            id="rec-contact-name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="rec-contact-phone">Teléfono de emergencia</Label>
          <Input
            id="rec-contact-phone"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <input
            type="checkbox"
            checked={hasNee}
            onChange={(e) => setHasNee(e.target.checked)}
          />
          Tiene necesidades educativas especiales (NEE)
        </label>
        <Text variant="caption" className="mt-1 text-gray-500">
          Información sensible: solo la ven secretaría, administración y el
          representante.
        </Text>

        {hasNee ? (
          <Textarea
            aria-label="Detalle de necesidades educativas especiales"
            className="mt-3"
            rows={3}
            value={neeNotes}
            onChange={(e) => setNeeNotes(e.target.value)}
          />
        ) : null}
      </div>

      {isSaved ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <Text variant="small" className="font-medium text-emerald-700">
            Ficha guardada.
          </Text>
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" isLoading={isSaving}>
          Guardar ficha
        </Button>
      </div>
    </form>
  );
}
