export interface AiConnectionCheck {
  ok: boolean;
  /** Código HTTP del proveedor, si respondió. */
  status: number | null;
  latencyMs: number;
  message: string;
}

export interface IAiConnectionChecker {
  /**
   * Verifica la clave y el modelo sin generar texto: no consume tokens.
   */
  check(apiKey: string, model: string): Promise<AiConnectionCheck>;
}