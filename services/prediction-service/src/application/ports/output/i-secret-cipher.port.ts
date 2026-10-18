/** Cifrado reversible para guardar secretos (como la clave de OpenAI) en la base. */
export interface ISecretCipher {
  encrypt(plain: string): string;
  decrypt(payload: string): string;
}