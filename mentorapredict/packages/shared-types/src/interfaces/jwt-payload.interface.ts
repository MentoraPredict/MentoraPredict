import { Role } from '../enums/role.enum';

/** Shape of the decoded JWT RS256 payload (read-only, no signing logic here) */
export interface JwtPayload {
  sub: string;    // userId (UUID)
  email: string;
  role: Role;
  iat: number;
  exp: number;
  iss: string;    // issuer
  aud: string;    // audience
}
