import { GradingScale, PromotionRule } from '../entities/institution-config.entity';
import {
  GradingComponent,
  PromotionSuggestion,
  SubjectResultStatus,
} from '../entities/grading.entity';

/**
 * Reglas de cálculo de notas y promoción.
 *
 * Funciones puras: la misma entrada y la misma configuración producen siempre
 * el mismo resultado (RNF-E-022). Ningún valor normativo vive aquí; la escala,
 * los pesos de los componentes y las reglas por nivel llegan como datos.
 */

const round = (value: number, decimals: number) =>
  Math.round((value + Number.EPSILON) * 10 ** decimals) / 10 ** decimals;

const mean = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length;

export function validateGradingComponents(components: GradingComponent[]): string[] {
  const errors: string[] = [];

  if (components.length === 0) {
    errors.push('Debe existir al menos un componente de calificación');
    return errors;
  }

  const codes = new Set<string>();
  for (const component of components) {
    if (!component.code.trim() || !component.name.trim()) {
      errors.push('Todos los componentes necesitan código y nombre');
    }
    if (codes.has(component.code)) {
      errors.push(`Componente repetido: ${component.code}`);
    }
    codes.add(component.code);

    if (!(component.weight > 0) || component.weight > 100) {
      errors.push(`${component.code}: el peso debe ser mayor que 0 y no superar 100`);
    }
  }

  const total = round(
    components.reduce((sum, c) => sum + c.weight, 0),
    2,
  );
  if (total !== 100) {
    errors.push(`Los pesos de los componentes deben sumar 100 (suman ${total})`);
  }
  return errors;
}

/** Mensaje de error si la nota no es válida para la escala configurada. */
export function validateGradeValue(scale: GradingScale, value: unknown): string | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 'La nota debe ser un número';
  }
  if (value < scale.minValue || value > scale.maxValue) {
    return `La nota debe estar entre ${scale.minValue} y ${scale.maxValue}`;
  }
  if (round(value, scale.decimals) !== value) {
    return `La nota admite hasta ${scale.decimals} decimales`;
  }
  return null;
}

export interface PeriodGradeResult {
  /** Promedio de cada componente; null si aún no tiene notas. */
  componentAverages: Record<string, number | null>;
  /** Nota del periodo; null si no hay ninguna nota. Parcial si falta algún componente. */
  value: number | null;
  /** true cuando todos los componentes tienen al menos una nota. */
  isComplete: boolean;
}

/**
 * Nota del periodo: promedio de cada componente ponderado por su peso.
 * Si falta algún componente el valor es parcial (pesos reescalados) y
 * `isComplete` es false, para que el docente vea su avance sin que ese número
 * se considere definitivo.
 */
export function computePeriodGrade(
  components: GradingComponent[],
  grades: { componentCode: string; value: number }[],
  scale: Pick<GradingScale, 'decimals'>,
): PeriodGradeResult {
  const componentAverages: Record<string, number | null> = {};
  let weighted = 0;
  let usedWeight = 0;
  let isComplete = true;

  for (const component of components) {
    const values = grades.filter((g) => g.componentCode === component.code).map((g) => g.value);

    if (values.length === 0) {
      componentAverages[component.code] = null;
      isComplete = false;
      continue;
    }
    const average = mean(values);
    componentAverages[component.code] = round(average, scale.decimals);
    weighted += average * component.weight;
    usedWeight += component.weight;
  }

  return {
    componentAverages,
    value: usedWeight === 0 ? null : round(weighted / usedWeight, scale.decimals),
    isComplete: components.length > 0 && isComplete,
  };
}

/**
 * Peso equivalente de cada actividad dentro de su periodo: el peso del
 * componente repartido en partes iguales entre sus actividades activas.
 * Sirve a los consumidores que promedian notas por peso (analítica) sin tener
 * que conocer los componentes; el resultado coincide con `computePeriodGrade`.
 */
export function effectiveActivityWeights(
  components: GradingComponent[],
  activities: { id: string; periodId: string; componentCode: string; isActive: boolean }[],
): Map<string, number> {
  const weights = new Map<string, number>();
  const componentWeight = new Map(components.map((c) => [c.code, c.weight]));

  const groups = new Map<string, string[]>();
  for (const activity of activities.filter((a) => a.isActive)) {
    const key = `${activity.periodId}:${activity.componentCode}`;
    groups.set(key, [...(groups.get(key) ?? []), activity.id]);
  }

  for (const [key, ids] of groups) {
    const code = key.slice(key.indexOf(':') + 1);
    const total = componentWeight.get(code) ?? 0;
    for (const id of ids) weights.set(id, round(total / ids.length, 4));
  }
  return weights;
}

/** Promedio anual: solo existe cuando todos los periodos tienen nota. */
export function computeAnnualAverage(
  periodValues: (number | null)[],
  scale: Pick<GradingScale, 'decimals'>,
): number | null {
  if (periodValues.length === 0 || periodValues.some((v) => v === null)) return null;
  return round(mean(periodValues as number[]), scale.decimals);
}

export interface SubjectResult {
  status: SubjectResultStatus;
  finalGrade: number | null;
}

/**
 * Resultado anual de una asignatura. El mínimo de aprobación sale de la regla
 * del nivel; si el nivel no tiene regla se usa el de la escala.
 */
export function resolveSubjectResult(input: {
  annualAverage: number | null;
  supplementaryGrade: number | null;
  rule: PromotionRule | undefined;
  scale: GradingScale;
}): SubjectResult {
  const { annualAverage, supplementaryGrade, rule, scale } = input;
  if (annualAverage === null) return { status: 'INCOMPLETE', finalGrade: null };

  const passing = rule?.minAverage ?? scale.passingGrade;
  if (annualAverage >= passing) return { status: 'APPROVED', finalGrade: annualAverage };

  const eligible = Boolean(rule?.allowsSupplementary) && annualAverage >= rule!.supplementaryMinAverage;
  if (!eligible) return { status: 'FAILED', finalGrade: annualAverage };

  if (supplementaryGrade === null) {
    return { status: 'SUPPLEMENTARY_PENDING', finalGrade: null };
  }
  // ⚠️ Nota final tras el supletorio pendiente de validar con la norma vigente.
  return supplementaryGrade >= passing
    ? { status: 'APPROVED', finalGrade: supplementaryGrade }
    : { status: 'FAILED', finalGrade: annualAverage };
}

export interface PromotionSuggestionResult {
  outcome: PromotionSuggestion;
  reasons: string[];
}

/**
 * Sugerencia de promoción según la política del nivel. Es solo una sugerencia:
 * la autoridad la confirma o la corrige dejando constancia.
 */
export function suggestPromotion(input: {
  results: SubjectResult[];
  rule: PromotionRule | undefined;
  attendanceFailed?: boolean;
}): PromotionSuggestionResult {
  const { results, rule, attendanceFailed = false } = input;
  const reasons: string[] = [];

  if (results.length === 0) {
    return { outcome: 'PENDING', reasons: ['El estudiante no tiene asignaturas con notas'] };
  }
  const incomplete = results.filter((r) => r.status === 'INCOMPLETE').length;
  if (incomplete > 0) {
    return { outcome: 'PENDING', reasons: [`${incomplete} asignatura(s) sin promedio anual completo`] };
  }
  const pending = results.filter((r) => r.status === 'SUPPLEMENTARY_PENDING').length;
  if (pending > 0) {
    return {
      outcome: 'PENDING_SUPPLEMENTARY',
      reasons: [`${pending} asignatura(s) con supletorio pendiente`],
    };
  }

  const failed = results.filter((r) => r.status === 'FAILED').length;
  if (failed > 0) reasons.push(`${failed} asignatura(s) reprobadas`);
  if (attendanceFailed) reasons.push('Superó el máximo de faltas injustificadas');

  if (reasons.length === 0) return { outcome: 'PROMOTED', reasons: [] };

  switch (rule?.repetitionPolicy ?? 'BY_GRADE') {
    case 'NOT_APPLICABLE':
      return { outcome: 'PROMOTED', reasons: [...reasons, 'El nivel no contempla repetición'] };
    case 'FAMILY_REQUEST':
      return {
        outcome: 'REVIEW',
        reasons: [...reasons, 'Requiere evaluación psicopedagógica y decisión con la familia'],
      };
    default:
      return { outcome: 'REPEATS', reasons };
  }
}
