export class UserProfileResponseDto {
  id!: string;

  // USER-SERVICE (perfil)
  photo?: string | null;
  bio?: string | null;
  cedula!: string;
  role!: string;
  status!: string;
  deletedAt?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
  // AUTH-SERVICE (datos extendidos)
  email!: string;
  firstName!: string;
  lastName!: string;
  isActive!: boolean;
}
