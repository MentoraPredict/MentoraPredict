import { FormEvent, useState } from "react";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";
import Textarea from "@/components/atoms/Textarea";
import Modal from "@/components/molecules/Modal";

import usePeriodClosure from "@/features/admin/hooks/usePeriodClosure";

const dateTime = (value: string) =>
  new Date(value).toLocaleString("es-EC", { dateStyle: "medium", timeStyle: "short" });

export default function AdminPeriodClosure() {
  const {
    schoolYears,
    selectedYear,
    selectedYearId,
    setSelectedYearId,
    selectedPeriodId,
    setSelectedPeriodId,
    closure,
    isLoading,
    isLoadingClosure,
    isSubmitting,
    error,
    actionError,
    clearActionError,
    close,
    reopen,
  } = usePeriodClosure();
  const [isReopenOpen, setIsReopenOpen] = useState(false);
  const [reason, setReason] = useState("");

  const isClosed = closure?.period.isClosed ?? false;
  const incomplete = closure?.totals.incomplete ?? 0;

  const closeReopenForm = () => {
    clearActionError();
    setReason("");
    setIsReopenOpen(false);
  };

  const submitReopen = async (event: FormEvent) => {
    event.preventDefault();

    if (await reopen(reason.trim())) closeReopenForm();
  };

  return (
    <Container className="py-8">
      <div className="mb-6">
        <Heading as="h3" className="text-gray-900">
          Cierre de periodos
        </Heading>
        <Text variant="small" className="mt-1 text-gray-600">
          Al cerrar un periodo se congelan las notas de todos los cursos. El
          promedio anual y la promoción solo consideran periodos cerrados.
        </Text>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="closure-year">Año lectivo</Label>
          <Select
            id="closure-year"
            value={selectedYearId}
            onChange={(e) => setSelectedYearId(e.target.value)}
          >
            {schoolYears.length === 0 ? <option value="">Sin años lectivos</option> : null}
            {schoolYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="closure-period">Periodo</Label>
          <Select
            id="closure-period"
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
          >
            {(selectedYear?.periods ?? []).map((period) => (
              <option key={period.id} value={period.id}>
                {period.name}
                {period.isClosed ? " (cerrado)" : period.isCurrent ? " (en curso)" : ""}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text variant="small" className="font-medium text-red-700">
            {error}
          </Text>
        </div>
      ) : null}

      {actionError && !isReopenOpen ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text variant="small" className="font-medium text-red-700">
            {actionError}
          </Text>
        </div>
      ) : null}

      {isLoading || isLoadingClosure ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small">Revisando las notas del periodo...</Text>
        </div>
      ) : null}

      {!isLoading && !isLoadingClosure && closure ? (
        <>
          <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Heading as="h5" className="text-gray-900">
                  {closure.period.name}
                </Heading>
                {isClosed ? (
                  <Badge tone="amber">
                    Cerrado{closure.period.closedAt ? ` el ${dateTime(closure.period.closedAt)}` : ""}
                  </Badge>
                ) : (
                  <Badge tone="green">Abierto</Badge>
                )}
                <Badge tone={incomplete === 0 ? "blue" : "red"}>
                  {incomplete === 0
                    ? "Todas las notas completas"
                    : `${incomplete} estudiante(s) sin nota completa`}
                </Badge>
              </div>

              {isClosed ? (
                <Button type="button" variant="outline" onClick={() => setIsReopenOpen(true)}>
                  Reabrir periodo
                </Button>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {incomplete > 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      isLoading={isSubmitting}
                      onClick={() => void close(true)}
                    >
                      Cerrar con notas incompletas
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    isLoading={isSubmitting}
                    disabled={incomplete > 0}
                    onClick={() => void close(false)}
                  >
                    Cerrar periodo
                  </Button>
                </div>
              )}
            </div>
            <Text variant="caption" className="mt-3 text-gray-600">
              {closure.totals.courses} asignatura(s) · {closure.totals.students} registro(s) de
              estudiante. Un estudiante está completo cuando tiene al menos una nota en cada
              componente de la calificación.
            </Text>
          </section>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-3 font-medium">Paralelo</th>
                  <th className="px-5 py-3 font-medium">Asignatura</th>
                  <th className="px-5 py-3 text-center font-medium">Estudiantes</th>
                  <th className="px-5 py-3 text-center font-medium">Sin nota completa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {closure.courses.map((course) => (
                  <tr key={course.subjectId}>
                    <td className="px-5 py-3 text-gray-700">{course.sectionLabel}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{course.name}</td>
                    <td className="px-5 py-3 text-center text-gray-700">{course.students}</td>
                    <td className="px-5 py-3 text-center">
                      <Badge tone={course.incomplete === 0 ? "green" : "red"}>
                        {course.incomplete}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {closure.courses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-gray-600">
                      Aún no hay asignaturas con estudiantes matriculados en este año lectivo.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          {closure.events.length > 0 ? (
            <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
              <Heading as="h5" className="mb-3 text-gray-900">
                Historial
              </Heading>
              <ul className="space-y-2">
                {closure.events.map((event) => (
                  <li key={event.id} className="text-sm text-gray-700">
                    <span className="font-medium">
                      {event.action === "CLOSE" ? "Cierre" : "Reapertura"}
                    </span>{" "}
                    por {event.performedByName} · {dateTime(event.performedAt)}
                    {event.reason ? ` — ${event.reason}` : ""}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : null}

      <Modal isOpen={isReopenOpen} onClose={closeReopenForm} ariaLabel="Reabrir periodo">
        <form
          onSubmit={submitReopen}
          className="w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-xl"
        >
          <div>
            <Heading as="h4" className="text-gray-900">
              Reabrir periodo
            </Heading>
            <Text variant="caption" className="mt-1 text-gray-600">
              Los docentes volverán a poder corregir notas y se descartará la foto del
              cierre. Debes cerrarlo de nuevo al terminar. Queda registrado quién lo hizo y
              por qué.
            </Text>
          </div>

          <div>
            <Label htmlFor="reopen-reason">Motivo</Label>
            <Textarea
              id="reopen-reason"
              rows={3}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {actionError ? (
            <Text variant="small" className="font-medium text-red-700">
              {actionError}
            </Text>
          ) : null}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={closeReopenForm}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting} disabled={reason.trim().length < 5}>
              Reabrir
            </Button>
          </div>
        </form>
      </Modal>
    </Container>
  );
}
