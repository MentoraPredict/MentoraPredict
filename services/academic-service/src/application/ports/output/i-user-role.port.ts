export const USER_ROLE_PORT_TOKEN = 'IUserRolePort';

export interface IUserRolePort {
  /** Rol del usuario según auth/user-service, o null si no existe o no responde. */
  getRole(userId: string): Promise<string | null>;
}
