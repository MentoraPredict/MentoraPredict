import { FiHeart, FiSmile, FiUsers } from "react-icons/fi";

import type { SurveyDefinition } from "@/features/survey/types";

/**
 * Catálogo mostrado en /student/survey. Las 3 son mock puro (isMocked:
 * true, pasos fijos) — la Socioeconómica conecta contra el catálogo real
 * de Fase D vía SOCIOECONOMIC_SURVEY_CODE/survey.service.ts, pero mientras
 * ese catálogo no tenga preguntas cargadas en el backend se mockea con
 * pasos fijos para poder demostrarla completa.
 */
export const SURVEY_CATALOG: SurveyDefinition[] = [
  {
    id: "socioeconomic",
    code: "SOCIOECONOMIC_DEMO",
    title: "Encuesta Socioeconómica",
    description:
      "Información para conocer tu contexto y brindarte un mejor acompañamiento.",
    icon: FiUsers,
    category: "Obligatoria",
    estimatedMinutes: 15,
    isMocked: true,
    steps: [
      {
        title: "Situación familiar",
        fields: [
          {
            id: "living_with",
            label: "¿Con quién vives actualmente?",
            type: "SINGLE_CHOICE",
            options: [
              "Padres",
              "Madre",
              "Padre",
              "Familiares (abuelos, tíos, etc.)",
              "Pareja/Cónyuge",
              "Solo",
              "Otros",
            ],
          },
          {
            id: "economic_dependents",
            label: "¿Cuántas personas dependen económicamente de tu hogar?",
            type: "NUMBER",
          },
        ],
      },
      {
        title: "Situación económica",
        fields: [
          {
            id: "income_source",
            label: "¿Cuál es la principal fuente de ingresos de tu hogar?",
            type: "SINGLE_CHOICE",
            options: [
              "Empleo de un familiar",
              "Negocio propio/familiar",
              "Beca o ayuda económica",
              "Trabajo del estudiante",
              "Otro",
            ],
          },
          {
            id: "student_works",
            label: "¿Trabajas actualmente mientras estudias?",
            type: "BOOLEAN",
          },
        ],
      },
      {
        title: "Vivienda y transporte",
        fields: [
          {
            id: "housing_type",
            label: "¿Cuál es la situación de tu vivienda?",
            type: "SINGLE_CHOICE",
            options: ["Propia", "Arrendada", "Familiar", "Otro"],
          },
          {
            id: "transportation",
            label: "¿Cómo te trasladas principalmente a la universidad?",
            type: "SINGLE_CHOICE",
            options: [
              "Transporte público",
              "Vehículo propio/familiar",
              "A pie",
              "Bicicleta",
              "Transporte universitario",
            ],
          },
        ],
      },
      {
        title: "Acceso a tecnología",
        fields: [
          {
            id: "has_own_computer",
            label: "¿Cuentas con un computador o laptop propio para tus estudios?",
            type: "BOOLEAN",
          },
          {
            id: "internet_quality",
            label: "¿Cómo calificarías tu acceso a internet en casa?",
            type: "SINGLE_CHOICE",
            options: ["Excelente", "Bueno", "Regular", "Malo", "No tengo acceso"],
          },
        ],
      },
    ],
  },
  {
    id: "syllabus-comprehension",
    code: "SYLLABUS_COMPREHENSION_DEMO",
    title: "Encuesta de Entendimiento del Sílabo",
    description:
      "Cuéntanos qué tan claro tienes los objetivos y contenidos de la materia.",
    icon: FiSmile,
    category: "Obligatoria",
    estimatedMinutes: 14,
    isMocked: true,
    // No se lista en /student/survey — se accede por materia desde el
    // botón "Encuesta del sílabo" de CourseActionsToolbar y puede
    // responderse todas las veces que haga falta por materia.
    showInCatalog: false,
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
            matrixColumns: [
              "Nada claro",
              "Poco claro",
              "Neutral",
              "Claro",
              "Muy claro",
              "Aún no se ha visto este tema",
            ],
          },
        ],
      },
      {
        title: "Hábitos de estudio",
        description:
          "Comparte señales de esfuerzo, comprensión y habilidades para mejorar las recomendaciones.",
        fields: [
          {
            id: "study_hours",
            label: "Promedio de horas de estudio",
            type: "SLIDER",
            min: 0,
            max: 8,
            step: 1,
            unit: "h",
            defaultValue: 4,
          },
          {
            id: "skills_focus",
            label: "Habilidades o temas que quieres reforzar",
            type: "TEXT",
          },
          {
            id: "subject_comprehension",
            label: "Nivel de comprensión de la materia",
            type: "RATING",
          },
          {
            id: "subject_mood",
            label: "Cómo te sientes con la materia",
            type: "RATING",
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
