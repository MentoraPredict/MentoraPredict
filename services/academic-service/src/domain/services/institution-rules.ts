import {
  AttendanceRule,
  EducationLevel,
  GradingScale,
  Institution,
  InstitutionLevel,
  PromotionRule,
  REPETITION_POLICIES,
  SHIFTS,
  SUSTENTATIONS,
} from '../entities/institution-config.entity';

/**
 * Reglas de validación de la configuración institucional.
 *
 * Los valores normativos (nota de aprobación, rangos cualitativos, umbrales
 * de asistencia) NO viven aquí: son datos que el administrador edita. Estas
 * funciones solo comprueban que la configuración sea coherente.
 * Todas devuelven la lista de errores; vacía significa válido.
 */

// ⚠️ Formato AMIE sin verificar contra norma oficial: se valida de forma laxa.
const AMIE_PATTERN = /^[A-Z0-9]{5,10}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const round = (value: number, decimals: number) =>
  Math.round(value * 10 ** decimals) / 10 ** decimals;

export function validateInstitution(data: Partial<Institution>): string[] {
  const errors: string[] = [];

  if (data.name !== undefined && !data.name.trim()) {
    errors.push('El nombre de la institución es obligatorio');
  }
  if (data.amie && !AMIE_PATTERN.test(data.amie.trim().toUpperCase())) {
    errors.push('El código AMIE debe tener entre 5 y 10 caracteres alfanuméricos');
  }
  if (data.sustentation && !SUSTENTATIONS.includes(data.sustentation)) {
    errors.push('El sostenimiento no es válido');
  }
  if (data.email && !EMAIL_PATTERN.test(data.email)) {
    errors.push('El correo institucional no es válido');
  }
  return errors;
}

export function validateInstitutionLevels(
  levels: InstitutionLevel[],
  catalog: EducationLevel[],
): string[] {
  const errors: string[] = [];
  const known = new Set(catalog.map((l) => l.code));
  const seen = new Set<string>();

  for (const level of levels) {
    if (!known.has(level.levelCode)) {
      errors.push(`Nivel desconocido: ${level.levelCode}`);
      continue;
    }
    if (seen.has(level.levelCode)) {
      errors.push(`Nivel repetido: ${level.levelCode}`);
    }
    seen.add(level.levelCode);

    const invalidShift = level.shifts.find((s) => !SHIFTS.includes(s));
    if (invalidShift) {
      errors.push(`${level.levelCode}: jornada no válida (${invalidShift})`);
    }
    if (level.isActive && level.shifts.length === 0) {
      errors.push(`${level.levelCode}: un nivel activo necesita al menos una jornada`);
    }
  }

  if (levels.length > 0 && !levels.some((l) => l.isActive)) {
    errors.push('La institución debe ofrecer al menos un nivel');
  }
  return errors;
}

export function validateGradingScale(scale: GradingScale): string[] {
  const errors: string[] = [];
  const { minValue, maxValue, passingGrade, decimals, bands } = scale;

  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 2) {
    errors.push('Los decimales deben ser 0, 1 o 2');
    return errors;
  }
  if (minValue >= maxValue) {
    errors.push('El valor mínimo de la escala debe ser menor que el máximo');
  }
  if (passingGrade < minValue || passingGrade > maxValue) {
    errors.push('La nota de aprobación debe estar dentro de la escala');
  }
  if (bands.length === 0) {
    errors.push('La escala necesita al menos un rango cualitativo');
    return errors;
  }

  const step = 1 / 10 ** decimals;
  const sorted = [...bands].sort((a, b) => a.minValue - b.minValue);
  const codes = new Set<string>();

  sorted.forEach((band, index) => {
    if (!band.code.trim() || !band.label.trim()) {
      errors.push(`Rango ${index + 1}: el código y la descripción son obligatorios`);
    }
    if (codes.has(band.code)) {
      errors.push(`Rango repetido: ${band.code}`);
    }
    codes.add(band.code);

    if (band.minValue > band.maxValue) {
      errors.push(`Rango ${band.code}: el mínimo no puede superar al máximo`);
    }
    const prev = sorted[index - 1];
    if (prev) {
      const expectedMin = round(prev.maxValue + step, decimals);
      if (round(band.minValue, decimals) < expectedMin) {
        errors.push(`Los rangos ${prev.code} y ${band.code} se traslapan`);
      } else if (round(band.minValue, decimals) > expectedMin) {
        errors.push(`Hay un hueco entre los rangos ${prev.code} y ${band.code}`);
      }
    }
  });

  if (round(sorted[0].minValue, decimals) !== round(minValue, decimals)) {
    errors.push('El primer rango debe empezar en el mínimo de la escala');
  }
  if (round(sorted[sorted.length - 1].maxValue, decimals) !== round(maxValue, decimals)) {
    errors.push('El último rango debe terminar en el máximo de la escala');
  }
  return errors;
}

export function validateAttendanceRule(rule: AttendanceRule): string[] {
  const errors: string[] = [];

  if (rule.maxUnjustifiedPct <= 0 || rule.maxUnjustifiedPct > 100) {
    errors.push('El porcentaje máximo de faltas debe estar entre 0 y 100');
  }

  const warnings = rule.warningPcts;
  if (warnings.some((w) => w <= 0 || w >= rule.maxUnjustifiedPct)) {
    errors.push('Los avisos deben ser mayores que 0 y menores que el máximo permitido');
  }
  if (new Set(warnings).size !== warnings.length) {
    errors.push('Los avisos de asistencia no pueden repetirse');
  }
  if (!Number.isInteger(rule.appliesFromLevelOrder) || rule.appliesFromLevelOrder < 1) {
    errors.push('El nivel desde el que aplica la regla no es válido');
  }
  if (
    rule.justificationDays !== null &&
    (!Number.isInteger(rule.justificationDays) || rule.justificationDays < 0)
  ) {
    errors.push('Los días para justificar deben ser un entero mayor o igual a 0');
  }
  return errors;
}

export function validatePromotionRules(
  rules: PromotionRule[],
  catalog: EducationLevel[],
  scale: Pick<GradingScale, 'minValue' | 'maxValue'>,
): string[] {
  const errors: string[] = [];
  const byCode = new Map(catalog.map((l) => [l.code, l]));
  const seen = new Set<string>();

  for (const rule of rules) {
    const level = byCode.get(rule.levelCode);
    if (!level) {
      errors.push(`Nivel desconocido: ${rule.levelCode}`);
      continue;
    }
    if (seen.has(rule.levelCode)) {
      errors.push(`Regla repetida para ${rule.levelCode}`);
    }
    seen.add(rule.levelCode);

    if (rule.minAverage < scale.minValue || rule.minAverage > scale.maxValue) {
      errors.push(`${rule.levelCode}: el promedio mínimo debe estar dentro de la escala`);
    }
    if (!REPETITION_POLICIES.includes(rule.repetitionPolicy)) {
      errors.push(`${rule.levelCode}: política de repetición no válida`);
    }
    // El supletorio solo existe desde EGB Media (catálogo del sistema).
    if (rule.allowsSupplementary && !level.allowsSupplementary) {
      errors.push(`${rule.levelCode}: este nivel no admite examen supletorio`);
    }
    if (rule.allowsSupplementary) {
      if (
        rule.supplementaryMinAverage < scale.minValue ||
        rule.supplementaryMinAverage >= rule.minAverage
      ) {
        errors.push(
          `${rule.levelCode}: el promedio para rendir el supletorio debe estar dentro de la escala y por debajo del promedio mínimo`,
        );
      }
    }
  }
  return errors;
}

/** Equivalencia cualitativa de una nota según la escala configurada. */
export function qualitativeFor(
  scale: GradingScale,
  value: number,
): GradingScale['bands'][number] | null {
  const v = round(value, scale.decimals);
  return (
    scale.bands.find(
      (b) => v >= round(b.minValue, scale.decimals) && v <= round(b.maxValue, scale.decimals),
    ) ?? null
  );
}

export function isPassing(scale: GradingScale, value: number): boolean {
  return round(value, scale.decimals) >= scale.passingGrade;
}
