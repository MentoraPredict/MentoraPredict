import { useCallback, useEffect, useMemo, useState } from "react";

import {
  defineSchedule,
  getCourseAttendance,
  getSessionAttendance,
  getSessions,
  saveSessionAttendance,
} from "@/services/attendance.service";
import type {
  ClassSession,
  CourseAttendance,
  ScheduleSlot,
} from "@/types/academic/attendance.types";
import { getApiErrorMessage } from "@/utils/apiError";

const todayInEcuador = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "America/Guayaquil" });

const dateOf = (session: ClassSession) => session.sessionDate.slice(0, 10);

export default function useCourseAttendance(courseId: string) {
  const [attendance, setAttendance] = useState<CourseAttendance | null>(null);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [marks, setMarks] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  /** Solo se registran clases que ya ocurrieron. */
  const availableSessions = useMemo(() => {
    const today = todayInEcuador();

    return [...sessions]
      .filter((session) => dateOf(session) <= today)
      .sort((a, b) => dateOf(b).localeCompare(dateOf(a)));
  }, [sessions]);

  const load = useCallback(async () => {
    setError(null);

    try {
      const [summary, list] = await Promise.all([
        getCourseAttendance(courseId),
        getSessions(courseId),
      ]);

      setAttendance(summary);
      setSessions(list);
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo cargar la asistencia del curso."));
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Al cargar, se propone la clase más reciente que aún no se registró.
  useEffect(() => {
    if (!attendance || selectedSessionId || availableSessions.length === 0) return;

    const recorded = new Set(attendance.recordedSessionIds);

    setSelectedSessionId(
      (availableSessions.find((s) => !recorded.has(s.id)) ?? availableSessions[0]).id
    );
  }, [attendance, availableSessions, selectedSessionId]);

  // Marcas de la clase elegida: lo ya registrado o todos presentes.
  useEffect(() => {
    if (!attendance || !selectedSessionId) return;

    let cancelled = false;

    getSessionAttendance(courseId, selectedSessionId)
      .then((records) => {
        if (cancelled) return;

        const saved = new Map(records.map((r) => [r.studentId, r.present]));

        setMarks(
          Object.fromEntries(
            attendance.students.map((s) => [s.studentId, saved.get(s.studentId) ?? true])
          )
        );
      })
      .catch((err) =>
        setError(getApiErrorMessage(err, "No se pudo cargar la asistencia de la clase."))
      );

    return () => {
      cancelled = true;
    };
  }, [attendance, courseId, selectedSessionId]);

  const setPresent = useCallback((studentId: string, present: boolean) => {
    setNotice(null);
    setMarks((current) => ({ ...current, [studentId]: present }));
  }, []);

  const save = useCallback(async () => {
    if (!selectedSessionId) return;

    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      await saveSessionAttendance(
        courseId,
        selectedSessionId,
        Object.entries(marks).map(([studentId, present]) => ({ studentId, present }))
      );
      setNotice("Asistencia guardada.");
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo guardar la asistencia."));
    } finally {
      setIsSaving(false);
    }
  }, [courseId, load, marks, selectedSessionId]);

  const saveSchedule = useCallback(
    async (slots: ScheduleSlot[]) => {
      setIsSaving(true);
      setError(null);

      try {
        await defineSchedule(courseId, slots);
        await load();

        return true;
      } catch (err) {
        setError(getApiErrorMessage(err, "No se pudo definir el horario."));

        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [courseId, load]
  );

  return {
    attendance,
    sessions,
    availableSessions,
    selectedSessionId,
    setSelectedSessionId: (id: string) => {
      setNotice(null);
      setSelectedSessionId(id);
    },
    marks,
    setPresent,
    isLoading,
    isSaving,
    error,
    notice,
    save,
    saveSchedule,
  };
}
