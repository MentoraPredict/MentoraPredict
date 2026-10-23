import api from "@/services/api";
import { endpoints } from "@/services/api/endpoints";
import type {
  ClassSession,
  CourseAttendance,
  JustificationItem,
  JustificationStatus,
  ScheduleSlot,
  SectionAttendanceRow,
  SessionRecord,
  StudentAttendance,
} from "@/types/academic/attendance.types";

export async function getCourseAttendance(
  subjectId: string
): Promise<CourseAttendance> {
  const response = await api.get<CourseAttendance>(
    endpoints.academic.courseAttendance(subjectId)
  );

  return response.data;
}

export async function getSessions(subjectId: string): Promise<ClassSession[]> {
  const response = await api.get<ClassSession[]>(
    endpoints.academic.subjectSessions(subjectId)
  );

  return response.data;
}

export async function defineSchedule(
  subjectId: string,
  slots: ScheduleSlot[]
): Promise<void> {
  await api.post(endpoints.academic.subjectSchedule(subjectId), { slots });
}

export async function getSessionAttendance(
  subjectId: string,
  sessionId: string
): Promise<SessionRecord[]> {
  const response = await api.get<SessionRecord[]>(
    endpoints.academic.sessionAttendance(subjectId, sessionId)
  );

  return response.data;
}

export async function saveSessionAttendance(
  subjectId: string,
  sessionId: string,
  records: SessionRecord[]
): Promise<void> {
  await api.post(endpoints.academic.sessionAttendance(subjectId, sessionId), {
    records,
  });
}

export async function getStudentAttendance(
  studentId: string
): Promise<StudentAttendance> {
  const response = await api.get<StudentAttendance>(
    endpoints.academic.studentAttendance(studentId)
  );

  return response.data;
}

export async function getSectionAttendance(
  sectionId: string
): Promise<SectionAttendanceRow[]> {
  const response = await api.get<SectionAttendanceRow[]>(
    endpoints.academic.sectionAttendance(sectionId)
  );

  return response.data;
}

export async function requestJustification(
  studentId: string,
  sessionId: string,
  reason: string
): Promise<void> {
  await api.post(endpoints.academic.studentJustifications(studentId), {
    sessionId,
    reason,
  });
}

export async function getJustifications(
  status?: JustificationStatus
): Promise<JustificationItem[]> {
  const response = await api.get<JustificationItem[]>(
    endpoints.academic.justifications,
    { params: status ? { status } : undefined }
  );

  return response.data;
}

export async function resolveJustification(
  id: string,
  approve: boolean,
  note?: string
): Promise<void> {
  await api.patch(endpoints.academic.justification(id), { approve, note });
}
