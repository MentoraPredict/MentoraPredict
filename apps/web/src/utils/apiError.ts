import { AxiosError } from "axios";

/** Mensaje legible de un error de la API; admite listas de validación. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(". ");
    }

    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
}
