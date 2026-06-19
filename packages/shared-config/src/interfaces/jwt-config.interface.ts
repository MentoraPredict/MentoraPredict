export interface JwtConfig {
  privateKeyPath: string;
  publicKeyPath: string;
  accessExpiresIn: number;   // seconds
  refreshExpiresIn: number;  // seconds
  issuer: string;
  audience: string;
}
