import api from "@/services/api";
import { endpoints } from "@/services/api/endpoints";
import type {
  CreateSchoolYearPayload,
  SchoolYear,
  SchoolYearStatus,
  UpdateGradingPeriodPayload,
} from "@/types/academic/school-year.types";

interface MaybeWrappedArray<T> {
  value?: T[];
  data?: T[];
  items?: T[];
}

function unwrapArray<T>(response: T[] | MaybeWrappedArray<T>): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.value ?? response.data ?? response.items ?? [];
}

export async function getSchoolYears(): Promise<SchoolYear[]> {
  const response = await api.get<SchoolYear[] | MaybeWrappedArray<SchoolYear>>(
    endpoints.academic.schoolYears
  );

  return unwrapArray(response.data);
}

export async function createSchoolYear(
  payload: CreateSchoolYearPayload
): Promise<SchoolYear> {
  const response = await api.post<SchoolYear>(
    endpoints.academic.schoolYears,
    payload
  );

  return response.data;
}

export async function changeSchoolYearStatus(
  id: string,
  status: SchoolYearStatus
): Promise<SchoolYear> {
  const response = await api.patch<SchoolYear>(
    endpoints.academic.schoolYearStatus(id),
    { status }
  );

  return response.data;
}

export async function deleteSchoolYear(id: string): Promise<void> {
  await api.delete(endpoints.academic.schoolYear(id));
}

export async function updateGradingPeriod(
  periodId: string,
  payload: UpdateGradingPeriodPayload
): Promise<void> {
  await api.put(endpoints.academic.period(periodId), payload);
}
