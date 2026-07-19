import { FaRobot } from "react-icons/fa";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import { SUGGESTED_PROMPTS } from "@/features/aiChat/mocks/aiChatConversations.mock";

interface AiChatWelcomeProps {
  onPromptSelect: (prompt: string) => void;
}

export default function AiChatWelcome({ onPromptSelect }: AiChatWelcomeProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 text-white">
        <FaRobot size={28} />
      </div>

      <div>
        <Heading as="h3" className="text-gray-900">
          ¿En qué puedo ayudarte hoy?
        </Heading>
        <Text variant="small" className="mx-auto mt-2 max-w-md text-gray-500">
          Pregúntame sobre tus materias, dudas de contenido o pide consejos de
          estudio. Estoy para acompañarte.
        </Text>
      </div>

      <div className="flex w-full max-w-lg flex-wrap justify-center gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => {
              onPromptSelect(prompt);
            }}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
