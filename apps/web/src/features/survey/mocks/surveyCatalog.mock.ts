import { FiHeart, FiSmile, FiUsers } from "react-icons/fi";

import { SOCIOECONOMIC_SURVEY_CODE } from "@/services/survey.service";
import type { SurveyDefinition } from "@/features/survey/types";

/**
 * Catálogo mostrado en /student/survey. Solo "Socioeconómica" conecta al
 * backend real (Fase D) — las otras 2 son mock puro, marcadas isMocked, tal
 * como confirmó el usuario ("las 3 visibles, solo Socioeconómica conecta al
 * backend real").
 */
export const SURVEY_CATALOG: SurveyDefinition[] = [
  {
    id: "socioeconomic",
    code: SOCIOECONOMIC_SURVEY_CODE,
    title: "Encuesta Socioeconómica",
    description:
      "Información para conocer tu contexto y brindarte un mejor acompañamiento.",
    icon: FiUsers,
    category: "Obligatoria",
    estimatedMinutes: 15,
    isMocked: false,
  },
  {
    id: "syllabus-comprehension",
    code: "SYLLABUS_COMPREHENSION_DEMO",
    title: "Encuesta de Entendimiento del Sílabo",
    description:
      "Cuéntanos qué tan claro tienes los objetivos y contenidos de la materia.",
    icon: FiSmile,
    category: "Obligatoria",
    estimatedMinutes: 10,
    isMocked: true,
    steps: [
      {
        title: "Objetivos de la materia",
        fields: [
          {
            id: "objectives_clarity",
            label: "¿Qué tan claros tienes los objetivos de la materia?",
            type: "SINGLE_CHOICE",
            options: ["Muy claros", "Claros", "Algo confusos", "Nada claros"],
          },
          {
            id: "objectives_feedback",
            label: "¿Hay algo que te gustaría que se explique mejor?",
            type: "TEXT",
          },
        ],
      },
      {
        title: "Ritmo de la materia",
        fields: [
          {
            id: "pace",
            label: "¿Cómo sientes el ritmo de avance de la materia?",
            type: "SINGLE_CHOICE",
            options: ["Muy rápido", "Adecuado", "Muy lento"],
          },
        ],
      },
      {
        title: "Contenidos del sílabo",
        fields: [
          {
            id: "topics_comprehension",
            label: "Califica tu nivel de entendimiento de los siguientes temas:",
            type: "MATRIX",
            matrixRows: [
              "Límites y continuidad",
              "Derivadas",
              "Aplicaciones de la derivada",
              "Integrales indefinidas",
              "Integrales definidas",
              "Series y sucesiones",
            ],
            matrixColumns: ["Nada claro", "Poco claro", "Neutral", "Claro", "Muy claro"],
          },
        ],
      },
    ],
  },
  {
    id: "wellbeing",
    code: "WELLBEING_DEMO",
    title: "Encuesta de Bienestar y Estrés Académico",
    description:
      "Ayúdanos a entender cómo te sientes para ofrecerte el apoyo adecuado.",
    icon: FiHeart,
    category: "Opcional",
    estimatedMinutes: 8,
    isMocked: true,
    steps: [
      {
        title: "Cómo te sientes",
        fields: [
          {
            id: "stress_level",
            label: "En general, ¿qué tan estresado/a te sientes esta semana?",
            type: "SINGLE_CHOICE",
            options: ["Nada", "Poco", "Moderado", "Bastante", "Mucho"],
          },
          {
            id: "sleep_hours",
            label: "¿Cuántas horas duermes en promedio por noche?",
            type: "NUMBER",
          },
        ],
      },
      {
        title: "Apoyo",
        fields: [
          {
            id: "needs_support",
            label: "¿Sientes que necesitas apoyo adicional en este momento?",
            type: "BOOLEAN",
          },
        ],
      },
    ],
  },
];

export function getSurveyDefinition(id: string): SurveyDefinition | undefined {
  return SURVEY_CATALOG.find((survey) => survey.id === id);
}
