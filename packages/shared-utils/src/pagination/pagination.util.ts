import { PaginationMeta } from '@mentorapredict/shared-types';

/** Pure pagination math — no DB dependency */
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export function normalizePage(page?: number): number {
  return Math.max(1, page ?? 1);
}

export function normalizeLimit(limit?: number): number {
  return Math.min(Math.max(1, limit ?? 20), 25); // RNF-035: max 25
}
