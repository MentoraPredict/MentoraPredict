import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { FiUploadCloud, FiTrash2, FiEdit2, FiCheck, FiX, FiPaperclip } from "react-icons/fi";
import Text from "@/components/atoms/Text";
import Input from "@/components/atoms/Input";
import Textarea from "@/components/atoms/Textarea";
import Button from "@/components/atoms/Button";
import IconButton from "@/components/atoms/IconButton";
import ErrorMessage from "@/components/atoms/ErrorMessage";
import {
  getSubjectTopics,
  createSubjectTopic,
  updateSubjectTopic,
  deleteSubjectTopic,
  uploadSubjectTopicFile,
  deleteSubjectTopicFile,
  type SubjectTopic,
} from "@/services/academic.service";

interface SyllabusTopicsPanelProps {
  subjectId: string;
  /** Sin borde ni relleno propios, para ir dentro de otra tarjeta. */
  bare?: boolean;
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

  for (const rawTitle of text.split(/\n+/)) {
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
  bare = false,
}: SyllabusTopicsPanelProps) {
  const [topics, setTopics] = useState<SubjectTopic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bulkText, setBulkText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [fileBusyId, setFileBusyId] = useState<string | null>(null);

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

  async function handleAttachFile(topicId: string, file: File | undefined) {
    if (!file) return;

    setFileBusyId(topicId);
    setError(null);
    try {
      const updated = await uploadSubjectTopicFile(topicId, file);
      setTopics((current) =>
        current.map((topic) => (topic.id === topicId ? updated : topic))
      );
    } catch (uploadError) {
      setError(
        getRequestErrorMessage(
          uploadError,
          "No se pudo adjuntar el archivo. Usa una imagen de hasta 2 MB o un pdf, docx, pptx o xlsx de hasta 10 MB."
        )
      );
    } finally {
      setFileBusyId(null);
    }
  }

  async function handleRemoveFile(topicId: string) {
    setFileBusyId(topicId);
    setError(null);
    try {
      const updated = await deleteSubjectTopicFile(topicId);
      setTopics((current) =>
        current.map((topic) => (topic.id === topicId ? updated : topic))
      );
    } catch (removeError) {
      setError(getRequestErrorMessage(removeError, "No se pudo quitar el archivo."));
    } finally {
      setFileBusyId(null);
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
      className={
        bare ? "" : "rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      }
    >
      <Text variant="caption" className="block">
        Escribe un tema por línea. Se detectarán automáticamente los temas nuevos. A cada tema puedes adjuntar un material para tus estudiantes.
      </Text>

      {error ? <ErrorMessage message={error} /> : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <Textarea
          value={bulkText}
          onChange={(event) => setBulkText(event.target.value)}
          placeholder={"Transformaciones lineales\nEspacios vectoriales\nValores propios"}
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
          <div className="mt-4 max-h-96 min-w-0 overflow-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="w-16 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    N.º
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Tema
                  </th>
                  <th className="w-56 px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    Material
                  </th>
                  <th className="w-28 px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topics.map((topic, index) => (
                  <tr key={topic.id}>
                    <td className="px-4 py-3 text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === topic.id ? (
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
                          className="px-3 py-1.5 text-sm"
                        />
                      ) : (
                        <Text variant="small" className="text-gray-900">
                          {topic.title}
                        </Text>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {topic.fileUrl ? (
                          <>
                            <a
                              href={topic.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="min-w-0 flex-1 truncate text-sm font-medium text-blue-700 hover:underline"
                              title={topic.originalFileName ?? "Archivo"}
                            >
                              {topic.originalFileName ?? "Archivo"}
                            </a>
                            <IconButton
                              onClick={() => void handleRemoveFile(topic.id)}
                              disabled={fileBusyId === topic.id}
                              aria-label={`Quitar el archivo de ${topic.title}`}
                              className="p-1.5"
                            >
                              <FiX className="text-gray-500" size={15} />
                            </IconButton>
                          </>
                        ) : (
                          <label
                            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-blue-400 hover:bg-blue-50 ${
                              fileBusyId === topic.id ? "pointer-events-none opacity-60" : ""
                            }`}
                          >
                            <FiPaperclip size={14} aria-hidden="true" />
                            {fileBusyId === topic.id ? "Subiendo…" : "Adjuntar"}
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*,.pdf,.docx,.pptx,.xlsx"
                              onChange={(event) => {
                                void handleAttachFile(topic.id, event.target.files?.[0]);
                                event.target.value = "";
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {editingId === topic.id ? (
                          <>
                            <IconButton
                              onClick={() => void handleSaveEdit(topic.id)}
                              disabled={isSaving}
                              aria-label="Guardar"
                              className="p-1.5"
                            >
                              <FiCheck className="text-green-600" size={16} />
                            </IconButton>
                            <IconButton
                              onClick={cancelEditing}
                              aria-label="Cancelar"
                              className="p-1.5"
                            >
                              <FiX className="text-gray-500" size={16} />
                            </IconButton>
                          </>
                        ) : (
                          <>
                            <IconButton
                              onClick={() => startEditing(topic)}
                              aria-label={`Editar ${topic.title}`}
                              className="p-1.5"
                            >
                              <FiEdit2 className="text-blue-600" size={15} />
                            </IconButton>
                            <IconButton
                              onClick={() => void handleDeleteTopic(topic.id)}
                              disabled={isSaving}
                              aria-label={`Eliminar ${topic.title}`}
                              className="p-1.5"
                            >
                              <FiTrash2 className="text-red-500" size={15} />
                            </IconButton>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
