import { useEffect, useState } from "react";

import Badge from "@/components/atoms/Badge";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";

import { getGradeLevels, getSections } from "@/services/academic-structure.service";
import { getSectionAttendance } from "@/services/attendance.service";
import { getSchoolYears } from "@/services/school-year.service";
import type { Section } from "@/types/academic/academic-structure.types";
import {
  ATTENDANCE_STATUS_LABELS,
  type AttendanceStatus,
  type SectionAttendanceRow,
} from "@/types/academic/attendance.types";
import { SHIFT_LABELS } from "@/types/academic/institution-config.types";
import type { SchoolYear } from "@/types/academic/school-year.types";
import { getApiErrorMessage } from "@/utils/apiError";

const STATUS_TONE: Record<AttendanceStatus, "green" | "amber" | "red"> = {
  OK: "green",
  WARNING: "amber",
  EXCEEDED: "red",
};

export default function AdminAttendanceFollowUp() {
  const [years, setYears] = useState<SchoolYear[]>([]);
  const [gradeNames, setGradeNames] = useState<Map<string, string>>(new Map());
  const [yearId, setYearId] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionId, setSectionId] = useState("");
  const [rows, setRows] = useState<SectionAttendanceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRows, setIsLoadingRows] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getSchoolYears(), getGradeLevels()])
      .then(([list, grades]) => {
        setYears(list);
        setGradeNames(new Map(grades.map((g) => [g.code, g.name])));
        setYearId(list.find((y) => y.status === "ACTIVE")?.id ?? list[0]?.id ?? "");
      })
      .catch((err) => setError(getApiErrorMessage(err, "No se pudo cargar la información base.")))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    setSectionId("");
    setRows([]);

    if (!yearId) {
      setSections([]);
      return;
    }

    getSections(yearId)
      .then((list) => setSections(list.filter((s) => s.isActive)))
      .catch((err) => setError(getApiErrorMessage(err, "No se pudieron cargar los paralelos.")));
  }, [yearId]);

  useEffect(() => {
    if (!sectionId) {
      setRows([]);
      return;
    }

    setIsLoadingRows(true);
    setError(null);

    getSectionAttendance(sectionId)
      .then(setRows)
      .catch((err) => {
        setRows([]);
        setError(getApiErrorMessage(err, "No se pudo cargar la asistencia del paralelo."));
      })
      .finally(() => setIsLoadingRows(false));
  }, [sectionId]);

  const flagged = rows.filter((row) => row.worstStatus !== "OK").length;

  return (
    <Container className="py-8">
      <div className="mb-6">
        <Heading as="h3" className="text-gray-900">
          Seguimiento de asistencia
        </Heading>
        <Text variant="small" className="mt-1 text-gray-600">
          Estudiantes de un paralelo ordenados por su situación de faltas
          injustificadas. Los que superan el límite quedan primero.
        </Text>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="att-year">Año lectivo</Label>
          <Select id="att-year" value={yearId} onChange={(e) => setYearId(e.target.value)}>
            {years.length === 0 ? <option value="">Sin años lectivos</option> : null}
            {years.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="att-section">Paralelo</Label>
          <Select id="att-section" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
            <option value="">Selecciona un paralelo</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {gradeNames.get(section.gradeLevelCode) ?? section.gradeLevelCode} «{section.name}» ·{" "}
                {SHIFT_LABELS[section.shift]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text variant="small" className="font-medium text-red-700">
            {error}
          </Text>
        </div>
      ) : null}

      {isLoading || isLoadingRows ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small">Cargando...</Text>
        </div>
      ) : null}

      {!isLoading && !isLoadingRows && sectionId ? (
        <section className="rounded-2xl border border-gray-200 bg-white">
          <header className="px-5 py-4">
            <Text variant="small" className="text-gray-600">
              {rows.length} estudiante(s) · {flagged} con aviso o límite superado
            </Text>
          </header>
          <div className="divide-y divide-gray-100 border-t border-gray-100">
            {rows.map((row) => (
              <div key={row.studentId} className="px-5 py-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Text variant="small" className="min-w-[12rem] flex-1 font-medium text-gray-900">
                    {row.name}
                  </Text>
                  <Badge tone={STATUS_TONE[row.worstStatus]}>
                    {ATTENDANCE_STATUS_LABELS[row.worstStatus]}
                  </Badge>
                </div>
                {row.worstStatus !== "OK" ? (
                  <Text variant="caption" className="mt-1 text-gray-600">
                    {row.courses
                      .filter((c) => c.status !== "OK")
                      .map((c) => `${c.name}: ${c.unjustifiedPct} % (${c.absences} falta(s))`)
                      .join(" · ")}
                  </Text>
                ) : null}
              </div>
            ))}
            {rows.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Text variant="small" className="text-gray-600">
                  Este paralelo no tiene estudiantes matriculados.
                </Text>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </Container>
  );
}
