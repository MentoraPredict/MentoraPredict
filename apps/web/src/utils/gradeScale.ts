/**
 * Escala de calificación escolar (MINEDUC): 0–10.
 *
 * Son valores de presentación para colorear indicadores y mensajes. La nota
 * mínima real de aprobación vive en la configuración institucional y la aplica
 * el backend; estos umbrales deben mantenerse alineados con
 * `services/analytics-service/src/domain/grade-scale.ts`.
 */
export const MAX_GRADE = 10;
export const PASSING_GRADE = 7;
/** Desde esta nota el desempeño se muestra como destacado. */
export const GOOD_GRADE = 8;
