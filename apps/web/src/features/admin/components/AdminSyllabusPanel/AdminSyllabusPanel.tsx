import { useEffect, useState } from "react";
import { AxiosError } from "axios";

import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import { getSubjectTopics, type SubjectTopic } from "@/services/academic.service";

interface AdminSyllabusPanelProps {
  subjectId: string;
}

function getRequestErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

export default function AdminSyllabusPanel({ subjectId }: AdminSyllabusPanelProps) {
  const [topics, setTopics] = useState<SubjectTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadTopics() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getSubjectTopics(subjectId);
        if (isMounted) setTopics(data);
      } catch (loadError) {
        if (isMounted) {
          setError(getRequestErrorMessage(loadError, "No se pudo cargar el sílabo."));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    if (subjectId) void loadTopics();

    return () => {
      isMounted = false;
    };
  }, [subjectId]);

  return (
    <section>
      <Heading as="h5" className="mb-1 text-gray-900">
        Sílabo del curso
      </Heading>
      <Text variant="small" className="mb-4 block text-gray-700">
        Temario cargado por el docente. Solo el docente puede editarlo.
      </Text>

      {isLoading ? (
        <Text variant="small" className="block text-gray-700">
          Cargando sílabo…
        </Text>
      ) : error ? (
        <Text variant="small" className="block font-medium text-red-700">
          {error}
        </Text>
      ) : topics.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5"
            >
              <Text variant="small" className="font-semibold text-blue-900">
                {topic.title}
              </Text>
            </div>
          ))}
        </div>
      ) : (
        <Text variant="small" className="block text-gray-700">
          El docente aún no ha cargado el sílabo de este curso.
        </Text>
      )}
    </section>
  );
}
