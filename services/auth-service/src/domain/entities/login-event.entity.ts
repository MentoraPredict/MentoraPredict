export type LoginMethod = 'LOCAL' | 'MICROSOFT';

// Registro de fecha/hora de acceso a la plataforma — Fase E
// (docs/database/database-update-plan.md §5.5). `deviceType` queda
// reservado sin poblar hasta que se construya detección real de
// dispositivo — el resto de las columnas son reales desde el día uno.
export class LoginEventEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly occurredAt: Date,
    public readonly loginMethod: LoginMethod,
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null,
    public readonly deviceType: string | null = null,
  ) {}
}
