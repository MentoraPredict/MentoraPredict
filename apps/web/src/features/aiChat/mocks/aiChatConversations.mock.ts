import type { AiConversation } from "@/features/aiChat/types";

/**
 * Réplica visual mockeada del chat con IA (sin conexión a un modelo real
 * todavía) — historial y respuestas fijas y deterministas, mismo criterio
 * que el resto de mocks del proyecto (nunca Math.random()).
 */
export const MOCK_CONVERSATIONS: AiConversation[] = [
  {
    id: "conv-derivadas",
    title: "Derivadas y regla de la cadena",
    createdAt: "2026-07-14T15:30:00.000Z",
    messages: [
      {
        id: "conv-derivadas-1",
        role: "user",
        content: "¿Cómo aplico la regla de la cadena en f(x) = (3x + 1)^4?",
        createdAt: "2026-07-14T15:30:00.000Z",
      },
      {
        id: "conv-derivadas-2",
        role: "assistant",
        content:
          "Para f(x) = (3x + 1)^4, tratas (3x + 1) como una función interna u(x). " +
          "La regla de la cadena dice: f'(x) = 4·(3x + 1)^3 · u'(x). Como u'(x) = 3, " +
          "el resultado final es f'(x) = 12·(3x + 1)^3.",
        createdAt: "2026-07-14T15:30:20.000Z",
      },
    ],
    resources: [
      {
        id: "res-derivadas-1",
        title: "Guía: Regla de la cadena paso a paso",
        description: "Explicación con 5 ejemplos resueltos de dificultad creciente.",
      },
      {
        id: "res-derivadas-2",
        title: "Video: Derivadas compuestas",
        description: "12 minutos, incluye ejercicios de práctica al final.",
      },
    ],
    tips: [
      { id: "tip-derivadas-1", text: "Identifica primero la función externa y la interna antes de derivar." },
      { id: "tip-derivadas-2", text: "Practica con al menos 5 ejercicios similares antes de la evaluación." },
    ],
  },
  {
    id: "conv-integrales",
    title: "Dudas sobre integrales definidas",
    createdAt: "2026-07-10T09:05:00.000Z",
    messages: [
      {
        id: "conv-integrales-1",
        role: "user",
        content: "¿Cuál es la diferencia entre una integral definida e indefinida?",
        createdAt: "2026-07-10T09:05:00.000Z",
      },
      {
        id: "conv-integrales-2",
        role: "assistant",
        content:
          "La integral indefinida ∫f(x)dx = F(x) + C representa una familia de funciones " +
          "(el resultado es otra función). La integral definida ∫[a,b] f(x)dx = F(b) − F(a) " +
          "representa un número: el área bajo la curva entre los límites a y b.",
        createdAt: "2026-07-10T09:05:25.000Z",
      },
    ],
    resources: [
      {
        id: "res-integrales-1",
        title: "Guía: Teorema fundamental del cálculo",
        description: "Conecta la derivación y la integración con ejemplos gráficos.",
      },
    ],
    tips: [
      { id: "tip-integrales-1", text: "Recuerda siempre evaluar F(b) − F(a) en ese orden, no al revés." },
    ],
  },
];

export const SUGGESTED_PROMPTS: string[] = [
  "Explícame la regla de la cadena",
  "¿Cómo resuelvo una integral definida?",
  "Ayúdame a entender límites",
  "Dame consejos para estudiar cálculo",
];

interface CannedReply {
  keywords: string[];
  reply: string;
  resources: AiConversation["resources"];
  tips: AiConversation["tips"];
}

const CANNED_REPLIES: CannedReply[] = [
  {
    keywords: ["cadena", "derivada"],
    reply:
      "La regla de la cadena se usa para derivar funciones compuestas: si f(x) = g(h(x)), " +
      "entonces f'(x) = g'(h(x)) · h'(x). Primero derivas la función externa dejando la interna " +
      "intacta, y luego multiplicas por la derivada de la función interna.",
    resources: [
      {
        id: "res-generic-derivadas",
        title: "Guía: Regla de la cadena paso a paso",
        description: "Explicación con 5 ejemplos resueltos de dificultad creciente.",
      },
    ],
    tips: [
      { id: "tip-generic-derivadas", text: "Identifica primero la función externa y la interna antes de derivar." },
    ],
  },
  {
    keywords: ["integral"],
    reply:
      "Para resolver una integral definida ∫[a,b] f(x)dx, primero encuentras la antiderivada " +
      "F(x), y luego calculas F(b) − F(a). El resultado es un número que representa el área " +
      "bajo la curva entre a y b.",
    resources: [
      {
        id: "res-generic-integrales",
        title: "Guía: Teorema fundamental del cálculo",
        description: "Conecta la derivación y la integración con ejemplos gráficos.",
      },
    ],
    tips: [
      { id: "tip-generic-integrales", text: "Recuerda siempre evaluar F(b) − F(a) en ese orden, no al revés." },
    ],
  },
  {
    keywords: ["límite", "limite"],
    reply:
      "Un límite describe el valor al que se acerca una función cuando su variable se aproxima " +
      "a un punto determinado. Para calcularlo, primero intenta sustituir directamente; si obtienes " +
      "una forma indeterminada (0/0), prueba factorizar o racionalizar.",
    resources: [
      {
        id: "res-generic-limites",
        title: "Guía: Límites y formas indeterminadas",
        description: "Casos comunes (0/0, ∞/∞) con estrategias de resolución.",
      },
    ],
    tips: [
      { id: "tip-generic-limites", text: "Prueba siempre la sustitución directa antes de aplicar técnicas avanzadas." },
    ],
  },
  {
    keywords: ["consejo", "estudiar", "estudio"],
    reply:
      "Para estudiar cálculo de forma efectiva: repasa la teoría antes de practicar, resuelve " +
      "ejercicios variados en vez de repetir el mismo tipo, y dedica sesiones cortas y frecuentes " +
      "en vez de una sola sesión larga.",
    resources: [],
    tips: [
      { id: "tip-generic-estudio-1", text: "Sesiones de 25-30 minutos con descansos son más efectivas que maratones de estudio." },
      { id: "tip-generic-estudio-2", text: "Explica el concepto en voz alta como si se lo enseñaras a alguien más." },
    ],
  },
];

const DEFAULT_REPLY: CannedReply = {
  keywords: [],
  reply:
    "Gracias por tu pregunta. Todavía estoy aprendiendo a responder este tipo de temas — " +
    "mientras tanto, te recomiendo revisar el material de la materia o consultarlo directamente " +
    "con tu docente.",
  resources: [],
  tips: [],
};

export function getCannedReply(userText: string): {
  reply: string;
  resources: AiConversation["resources"];
  tips: AiConversation["tips"];
} {
  const normalized = userText.toLowerCase();
  const match = CANNED_REPLIES.find((candidate) =>
    candidate.keywords.some((keyword) => normalized.includes(keyword))
  );
  const { reply, resources, tips } = match ?? DEFAULT_REPLY;
  return { reply, resources, tips };
}
