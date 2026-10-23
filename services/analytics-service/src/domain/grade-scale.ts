/**
 * Escala de calificaciones del sistema educativo ecuatoriano: 0–10, con 7 como
 * mínimo de aprobación. Es la escala por defecto de la institución; los
 * umbrales de riesgo se expresan sobre ella.
 * ⚠️ Pendiente: leer la escala configurada en academic-service en lugar de
 * fijarla aquí, para que un cambio en Configuración se refleje en el riesgo.
 */
export const MAX_GRADE = 10;
export const PASSING_GRADE = 7;
/** Por debajo de este promedio el estudiante reprueba con holgura. */
export const SEVERELY_FAILING_GRADE = 5;
/** Piso de la clasificación por promedio en el tablero institucional. */
export const MEDIUM_RISK_AVERAGE = 6;
