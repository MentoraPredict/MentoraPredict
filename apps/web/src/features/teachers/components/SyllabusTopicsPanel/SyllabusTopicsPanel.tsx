import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import Textarea from "@/components/atoms/Textarea";

interface SyllabusTopicsPanelProps {
  value: string;
  onChange: (value: string) => void;
}

export function parseSyllabusTopics(value: string) {
  return value
    .split(/\n|;/)
    .map((topic) => topic.trim())
    .filter(Boolean);
}

export default function SyllabusTopicsPanel({
  value,
  onChange,
}: SyllabusTopicsPanelProps) {
  const topics = parseSyllabusTopics(value);

  return (
    <section
      className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-6
                shadow-sm
            "
    >
      <Heading as="h5" className="text-gray-900">
        Temas del syllabus
      </Heading>

      <Text variant="caption" className="mt-2 block">
        Escribe un tema por línea o sepáralos con punto y coma. Estos temas
        luego aparecerán al estudiante como encuesta de comprensión en escala
        numérica.
      </Text>

      <Textarea
        rows={6}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder={`Ejemplo:
Vectores
Matrices
Transformaciones lineales

O también:
Vectores; Matrices; Transformaciones lineales`}
        className="mt-4"
      />

      {topics.length > 0 ? (
        <div className="mt-4">
          <Text variant="caption" className="font-semibold text-gray-700">
            Temas detectados: {topics.length}
          </Text>

          <div className="mt-3 flex flex-wrap gap-2">
            {topics.map((topic) => (
              <span
                key={topic}
                className="
                                    rounded-full
                                    bg-blue-100
                                    px-3
                                    py-1
                                    text-xs
                                    font-semibold
                                    text-blue-700
                                "
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
