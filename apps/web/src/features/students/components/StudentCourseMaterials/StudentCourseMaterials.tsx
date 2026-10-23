import { useEffect, useState } from "react";
import { FiDownload } from "react-icons/fi";
import { Link } from "react-router-dom";

import Text from "@/components/atoms/Text";
import { getStudentCourseUploadDataPath } from "@/routes/paths";
import { getSubjectTopics, type SubjectTopic } from "@/services/academic.service";

import type { Course } from "@/types/course";

interface StudentCourseMaterialsProps {
  course: Course;
}

const headerCellClassName =
  "px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500";

/** Temas del sílabo de la materia y los archivos que comparte el docente. */
export default function StudentCourseMaterials({ course }: StudentCourseMaterialsProps) {
  const [topics, setTopics] = useState<SubjectTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setError(null);

    getSubjectTopics(course.id)
      .then((data) => {
        if (!isCancelled) setTopics(data);
      })
      .catch(() => {
        if (!isCancelled) setError("No se pudieron cargar los temas de la materia.");
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [course.id]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
        <Text variant="small">Cargando temas...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
        <Text variant="small" className="font-medium text-red-700">
          {error}
        </Text>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
        <Text variant="small">
          Tu docente aún no ha cargado los temas de esta materia.
        </Text>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="min-w-0 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className={`${headerCellClassName} w-16`}>N.º</th>
              <th className={headerCellClassName}>Tema</th>
              <th className={`${headerCellClassName} w-64`}>Material</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {topics.map((topic, index) => (
              <tr key={topic.id}>
                <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                <td className="px-4 py-3">
                  <Text variant="small" className="font-medium text-gray-900">
                    {topic.title}
                  </Text>
                  {topic.description ? (
                    <Text variant="caption" className="mt-0.5 text-gray-500">
                      {topic.description}
                    </Text>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  {topic.fileUrl ? (
                    <a
                      href={topic.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex max-w-full items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
                    >
                      <FiDownload size={15} aria-hidden="true" className="shrink-0" />
                      <span className="truncate">{topic.originalFileName ?? "Descargar"}</span>
                    </a>
                  ) : (
                    <span className="text-gray-400">Sin material</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Text variant="caption" className="text-gray-500">
        Cuando estudies un tema, califica cuánto lo entiendes en{" "}
        <Link
          to={getStudentCourseUploadDataPath(course.id)}
          className="font-medium text-blue-700 hover:underline"
        >
          Registrar avance
        </Link>
        .
      </Text>
    </div>
  );
}
