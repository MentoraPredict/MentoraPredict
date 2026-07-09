import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { FiUploadCloud, FiTrash2, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import Button from "@/components/atoms/Button";
import IconButton from "@/components/atoms/IconButton";
import ErrorMessage from "@/components/atoms/ErrorMessage";
import Pagination from "@/components/molecules/Pagination";
import usePagination from "@/hooks/usePagination";
import {
  getSubjectTopics,
  createSubjectTopic,
  updateSubjectTopic,
  deleteSubjectTopic,
  type SubjectTopic,
} from "@/services/academic.service";

const TOPICS_PER_PAGE = 8;

interface SyllabusTopicsPanelProps {
  subjectId: string;
}

function getRequestErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

function parseSyllabusTopics(text: string): string[] {
  const seen = new Set<string>();
  const titles: string[] = [];

  for (const rawTitle of text.split(/[;\n]+/)) {
    const title = rawTitle.trim();
    const key = title.toLowerCase();
    if (title && !seen.has(key)) {
      seen.add(key);
      titles.push(title);
    }
  }

  return titles;
}

export default function SyllabusTopicsPanel({
  subjectId,
}: SyllabusTopicsPanelProps) {
  const [topics, setTopics] = useState<SubjectTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bulkText, setBulkText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const {
    currentPage,
    paginatedItems: paginatedTopics,
    totalItems,
    totalPages,
    setCurrentPage,
  } = usePagination(topics, TOPICS_PER_PAGE, subjectId);

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
          setError(getRequestErrorMessage(loadError, "No se pudieron cargar los temas del sílabo."));
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

  async function handleBulkAdd() {
    const parsedTitles = parseSyllabusTopics(bulkText);
    if (!parsedTitles.length || isSaving) return;

    const existingTitles = new Set(
      topics.map((topic) => topic.title.trim().toLowerCase())
    );
    const newTitles = parsedTitles.filter(
      (title) => !existingTitles.has(title.toLowerCase())
    );

    if (!newTitles.length) {
      setError("Esos temas ya estan cargados en el sílabo.");
      return;
    }

    setIsSaving(true);
    setError(null);

    let nextOrder = topics.length;
    let createdCount = 0;

    try {
      for (const title of newTitles) {
        const created = await createSubjectTopic(subjectId, {
          title,
          order: nextOrder,
        });
        nextOrder += 1;
        createdCount += 1;
        setTopics((current) => [...current, created]);
      }
      setBulkText("");
    } catch (saveError) {
      const pendingCount = newTitles.length - createdCount;
      setError(
        getRequestErrorMessage(
          saveError,
          `Se cargaron ${createdCount} temas antes de fallar. Revisa e intenta de nuevo con los ${pendingCount} restantes.`
        )
      );
    } finally {
      setIsSaving(false);
    }
  }

  function startEditing(topic: SubjectTopic) {
    setEditingId(topic.id);
    setEditingTitle(topic.title);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingTitle("");
  }

  async function handleSaveEdit(topicId: string) {
    const title = editingTitle.trim();
    if (!title) return;

    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateSubjectTopic(topicId, { title });
      setTopics((current) =>
        current.map((topic) => (topic.id === topicId ? updated : topic))
      );
      cancelEditing();
    } catch (saveError) {
      setError(getRequestErrorMessage(saveError, "No se pudo actualizar el tema."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTopic(topicId: string) {
    setIsSaving(true);
    setError(null);
    try {
      await deleteSubjectTopic(topicId);
      setTopics((current) => current.filter((topic) => topic.id !== topicId));
    } catch (deleteError) {
      setError(getRequestErrorMessage(deleteError, "No se pudo eliminar el tema."));
    } finally {
      setIsSaving(false);
    }
  }

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
        Pega el temario completo separado por punto y coma (;) o con un salto
        de línea por tema. Se detectarán automáticamente los temas nuevos.
      </Text>

      {error ? <ErrorMessage message={error} /> : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <Textarea
          value={bulkText}
          onChange={(event) => setBulkText(event.target.value)}
          placeholder={"Ej: Transformaciones lineales; Espacios vectoriales; Valores propios\no un tema por línea"}
          rows={3}
          disabled={isSaving}
          className="sm:flex-1"
        />
        <Button
          type="button"
          onClick={() => void handleBulkAdd()}
          disabled={isSaving || !bulkText.trim()}
          className="shrink-0"
        >
          <FiUploadCloud className="mr-1" /> Cargar temas
        </Button>
      </div>

      {isLoading ? (
        <Text variant="caption" className="mt-4 block">
          Cargando temas…
        </Text>
      ) : topics.length > 0 ? (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {paginatedTopics.map((topic) => (
              <div
                key={topic.id}
                className="flex items-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 py-1.5 pl-3 pr-1.5"
              >
                {editingId === topic.id ? (
                  <>
                    <div className="w-40">
                      <Input
                        value={editingTitle}
                        onChange={(event) => setEditingTitle(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            void handleSaveEdit(topic.id);
                          }
                          if (event.key === "Escape") cancelEditing();
                        }}
                        autoFocus
                        className="px-2 py-1 text-xs"
                      />
                    </div>
                    <IconButton
                      onClick={() => void handleSaveEdit(topic.id)}
                      disabled={isSaving}
                      aria-label="Guardar"
                      className="p-1"
                    >
                      <FiCheck className="text-green-600" size={14} />
                    </IconButton>
                    <IconButton
                      onClick={cancelEditing}
                      aria-label="Cancelar"
                      className="p-1"
                    >
                      <FiX className="text-gray-500" size={14} />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <Text variant="caption" className="font-medium text-blue-800">
                      {topic.title}
                    </Text>
                    <IconButton
                      onClick={() => startEditing(topic)}
                      aria-label={`Editar ${topic.title}`}
                      className="p-1"
                    >
                      <FiEdit2 className="text-blue-600" size={13} />
                    </IconButton>
                    <IconButton
                      onClick={() => void handleDeleteTopic(topic.id)}
                      disabled={isSaving}
                      aria-label={`Eliminar ${topic.title}`}
                      className="p-1"
                    >
                      <FiTrash2 className="text-red-500" size={13} />
                    </IconButton>
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              pageSize={TOPICS_PER_PAGE}
              totalItems={totalItems}
              totalPages={totalPages}
              itemLabel="temas"
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      ) : (
        <Text variant="caption" className="mt-4 block">
          Aún no has cargado ningún tema.
        </Text>
      )}
    </section>
  );
}
