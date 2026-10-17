import { ConflictException } from '@nestjs/common';

/**
 * Las asignaturas de un paralelo se califican solo desde el libro de
 * calificaciones, que respeta componentes, periodos y cierres. Los flujos
 * anteriores (nota única por asignatura, evaluaciones con peso, importación)
 * siguen disponibles únicamente para las asignaturas sin paralelo.
 */
export function assertLegacyCourse(subject: { sectionId?: string | null }): void {
  if (subject.sectionId) {
    throw new ConflictException(
      'Las asignaturas de un paralelo se califican desde el libro de calificaciones',
    );
  }
}
