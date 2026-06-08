/** Reusable pagination query DTO — import in any service's controller */
export class PaginationQueryDto {
  page?: number;   // default 1
  limit?: number;  // default 20, max 25 per RNF-035
}
