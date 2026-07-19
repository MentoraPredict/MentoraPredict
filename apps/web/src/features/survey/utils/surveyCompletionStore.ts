// Rastro local de encuestas mockeadas completadas — solo para las 2 encuestas
// de ejemplo (Entendimiento del Sílabo, Bienestar y Estrés), que no tienen
// backend real detrás. La encuesta Socioeconómica usa su propio historial
// real (getMySurveyResponses). Persistido en localStorage para que la
// pestaña "Completadas" sobreviva a un refresh, sin necesitar backend.

const STORAGE_KEY = "mp_mock_survey_completions";

interface MockCompletionRecord {
  surveyId: string;
  completedAt: string;
  durationMinutes: number;
}

function readAll(): MockCompletionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockCompletionRecord[]) : [];
  } catch {
    return [];
  }
}

export function getMockCompletion(surveyId: string): MockCompletionRecord | null {
  return readAll().find((record) => record.surveyId === surveyId) ?? null;
}

export function recordMockCompletion(surveyId: string, durationMinutes: number): void {
  const records = readAll().filter((record) => record.surveyId !== surveyId);
  records.push({
    surveyId,
    completedAt: new Date().toISOString(),
    durationMinutes,
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Almacenamiento no disponible (modo privado, cuota llena) — la
    // finalización sigue funcionando, solo no persiste entre recargas.
  }
}
