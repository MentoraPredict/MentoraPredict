import { FormEvent, useEffect, useState } from "react";
import { FiArrowLeft } from "react-icons/fi";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";
import useGradebook from "@/features/teachers/hooks/useGradebook";
import { getTeacherCourseGradebookPath } from "@/routes/paths";

interface TeacherCourseActivityProps {
  courseId: string;
  /** `new` crea una actividad; cualquier otro valor es el id de una existente. */
  activityId: string;
}

/** Vista propia de una actividad: crearla, editar sus datos o archivarla. */
export default function TeacherCourseActivity({
  courseId,
  activityId,
}: TeacherCourseActivityProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNew = activityId === "new";
  const { gradebook, isLoading, isSaving, error, addActivity, editActivity, archiveActivity } =
    useGradebook(courseId, searchParams.get("period") ?? undefined);
  const activity = gradebook?.activities.find((item) => item.id === activityId);

  const [name, setName] = useState("");
  const [componentCode, setComponentCode] = useState(
    searchParams.get("component") ?? "",
  );
  const [dueDate, setDueDate] = useState("");
  const [confirmArchive, setConfirmArchive] = useState(false);

  useEffect(() => {
    if (activity) {
      setName(activity.name);
      setComponentCode(activity.componentCode);
      setDueDate(activity.dueDate ? activity.dueDate.slice(0, 10) : "");
    } else if (isNew && gradebook && !componentCode) {
      setComponentCode(gradebook.components[0]?.code ?? "");
    }
    // Solo al cargar la actividad o el libro, no en cada tecla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activity?.id, gradebook?.period.id]);

  const backPath = getTeacherCourseGradebookPath(courseId);

  if (isLoading && !gradebook) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
        <Text variant="small">Cargando actividad...</Text>
      </div>
    );
  }

  if (!gradebook || (!isNew && !activity)) {
    return (
      <div className="space-y-3 rounded-xl border border-red-100 bg-red-50 px-5 py-4">
        <Text variant="small" className="font-medium text-red-700">
          {error ?? "No se encontró la actividad."}
        </Text>
        <Link to={backPath} className="text-sm font-medium text-blue-700 hover:underline">
          Volver a calificaciones
        </Link>
      </div>
    );
  }

  const isReadOnly = gradebook.period.isClosed;
  const hasChanges =
    !activity ||
    name.trim() !== activity.name ||
    componentCode !== activity.componentCode ||
    dueDate !== (activity.dueDate ? activity.dueDate.slice(0, 10) : "");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = { name: name.trim(), componentCode, dueDate: dueDate || null };
    const ok = activity
      ? await editActivity(activity.id, payload)
      : await addActivity(payload);

    if (ok) navigate(backPath);
  };

  const handleArchive = async () => {
    if (!activity) return;
    if (await archiveActivity(activity.id)) navigate(backPath);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to={backPath}
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 hover:underline"
        >
          <FiArrowLeft size={14} aria-hidden="true" />
          Volver a calificaciones
        </Link>
        <Heading as="h3" className="mt-3 text-gray-900">
          {activity ? activity.name : "Nueva actividad"}
        </Heading>
        <Text variant="small" className="text-gray-600">
          Periodo «{gradebook.period.name}»
          {isReadOnly ? " · cerrado: solo lectura" : ""}
        </Text>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text variant="small" className="font-medium text-red-700">
            {error}
          </Text>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="activity-name">Nombre</Label>
            <Input
              id="activity-name"
              value={name}
              maxLength={200}
              disabled={isReadOnly}
              placeholder="Lección 1, Taller, Prueba del periodo…"
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="activity-component">Componente</Label>
            <Select
              id="activity-component"
              value={componentCode}
              disabled={isReadOnly}
              onChange={(event) => setComponentCode(event.target.value)}
            >
              {gradebook.components.map((component) => (
                <option key={component.code} value={component.code}>
                  {component.name} ({component.weight}%)
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="activity-due">Fecha (opcional)</Label>
            <Input
              id="activity-due"
              type="date"
              value={dueDate}
              disabled={isReadOnly}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
        </div>

        {activity ? (
          <dl className="grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-3">
            <div>
              <Text variant="caption" className="font-bold uppercase text-gray-500">
                Notas registradas
              </Text>
              <Text variant="small" className="mt-1 text-gray-900">
                {activity.gradeCount} de {gradebook.students.length} estudiantes
              </Text>
            </div>
            <div>
              <Text variant="caption" className="font-bold uppercase text-gray-500">
                Periodo
              </Text>
              <Text variant="small" className="mt-1 text-gray-900">
                {gradebook.period.name}
              </Text>
            </div>
            <div>
              <Text variant="caption" className="font-bold uppercase text-gray-500">
                Estado
              </Text>
              <div className="mt-1">
                <Badge tone={activity.isActive ? "green" : "neutral"}>
                  {activity.isActive ? "Activa" : "Archivada"}
                </Badge>
              </div>
            </div>
          </dl>
        ) : null}

        {!isReadOnly ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-5">
            {activity ? (
              confirmArchive ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Text variant="small" className="text-gray-700">
                    ¿Archivar esta actividad? Dejará de verse en la tabla.
                  </Text>
                  <Button
                    type="button"
                    isLoading={isSaving}
                    className="bg-red-700 px-3 py-2 text-sm hover:bg-red-800"
                    onClick={() => void handleArchive()}
                  >
                    Sí, archivar
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="px-3 py-2 text-sm"
                    onClick={() => setConfirmArchive(false)}
                  >
                    No
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="px-4 py-2 text-sm"
                  onClick={() => setConfirmArchive(true)}
                >
                  Archivar actividad
                </Button>
              )
            ) : (
              <span />
            )}

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(backPath)}>
                Cancelar
              </Button>
              {hasChanges ? (
                <Button type="submit" isLoading={isSaving} disabled={!name.trim()}>
                  {activity ? "Guardar cambios" : "Crear actividad"}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
      </form>
    </div>
  );
}