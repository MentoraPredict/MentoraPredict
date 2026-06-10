export interface IEmailPort {
  sendPasswordReset(email: string, token: string): Promise<void>;
}
