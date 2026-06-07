/** Common response shape for any persisted entity */
export class BaseEntityDto {
  id!: string;        // UUID
  createdAt!: string; // ISO 8601
  updatedAt!: string;
}
