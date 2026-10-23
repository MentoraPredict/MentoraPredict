import api from "@/services/api";
import { endpoints } from "@/services/api/endpoints";
import type {
  Consent,
  ConsentPurpose,
  EnrollmentResult,
  GuardianLink,
  LinkGuardianPayload,
  MyStudent,
  SectionEnrollment,
  StudentProfile,
  StudentProfilePayload,
} from "@/types/academic/people-enrollment.types";

export async function getStudentProfile(studentId: string): Promise<StudentProfile> {
  const response = await api.get<StudentProfile>(
    endpoints.academic.studentProfile(studentId)
  );

  return response.data;
}

export async function saveStudentProfile(
  studentId: string,
  payload: StudentProfilePayload
): Promise<StudentProfile> {
  const response = await api.put<StudentProfile>(
    endpoints.academic.studentProfile(studentId),
    payload
  );

  return response.data;
}

export async function getStudentGuardians(studentId: string): Promise<GuardianLink[]> {
  const response = await api.get<GuardianLink[]>(
    endpoints.academic.studentGuardians(studentId)
  );

  return response.data;
}

export async function linkGuardian(
  studentId: string,
  payload: LinkGuardianPayload
): Promise<void> {
  await api.post(endpoints.academic.studentGuardians(studentId), payload);
}

export async function unlinkGuardian(
  studentId: string,
  guardianId: string
): Promise<void> {
  await api.delete(endpoints.academic.studentGuardian(studentId, guardianId));
}

export async function getStudentConsents(studentId: string): Promise<Consent[]> {
  const response = await api.get<Consent[]>(
    endpoints.academic.studentConsents(studentId)
  );

  return response.data;
}

export async function grantConsent(
  studentId: string,
  purpose: ConsentPurpose
): Promise<void> {
  await api.post(endpoints.academic.studentConsents(studentId), { purpose });
}

export async function revokeConsent(
  studentId: string,
  purpose: ConsentPurpose
): Promise<void> {
  await api.delete(endpoints.academic.studentConsent(studentId, purpose));
}

export async function getMyStudents(): Promise<MyStudent[]> {
  const response = await api.get<MyStudent[]>(endpoints.academic.myStudents);

  return response.data;
}

export async function getSectionEnrollments(
  sectionId: string
): Promise<SectionEnrollment[]> {
  const response = await api.get<SectionEnrollment[]>(
    endpoints.academic.sectionEnrollments(sectionId)
  );

  return response.data;
}

export async function enrollStudents(
  sectionId: string,
  studentIds: string[],
  notes?: string
): Promise<EnrollmentResult[]> {
  const response = await api.post<EnrollmentResult[]>(
    endpoints.academic.sectionEnrollments(sectionId),
    { studentIds, notes }
  );

  return response.data;
}

export async function endEnrollment(
  enrollmentId: string,
  status: "WITHDRAWN" | "TRANSFERRED",
  notes?: string
): Promise<void> {
  await api.patch(endpoints.academic.endStudentEnrollment(enrollmentId), {
    status,
    notes,
  });
}
