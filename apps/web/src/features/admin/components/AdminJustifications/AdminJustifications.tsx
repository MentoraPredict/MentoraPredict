import { FormEvent, useCallback, useEffect, useState } from "react";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";
import Textarea from "@/components/atoms/Textarea";
import Modal from "@/components/molecules/Modal";

import { getJustifications, resolveJustification } from "@/services/attendance.service";
import {
  JUSTIFICATION_LABELS,
  type JustificationItem,
  type JustificationStatus,
} from "@/types/academic/attendance.types";
import { useAuthStore } from "@/store/auth.store";
import { getApiErrorMessage } from "@/utils/apiError";

const TONE: Record<JustificationStatus, "amber" | "green" | "red"> = {
  PENDING: "amber",
  APPROVED: "green",
  REJECTED: "red",
};

export default function AdminJustifications() {
  const role = useAuthStore((state) => state.user?.role);
  // Solo inspección y administración resuelven; el DECE consulta.
  const canResolve = role === "ADMIN" || role === "INSPECTOR";

  const [status, setStatus] = useState<JustificationStatus>("PENDING");
  const [items, setItems] = useState<JustificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<JustificationItem | null>(null);
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setItems(await getJustifications(status));
    } catch (err) {
      setItems([]);
      setError(getApiErrorMessage(err, "No se pudieron cargar las justificaciones."));
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const close = () => {
    setNote("");
    setTarget(null);
  };

  const resolve = async (item: JustificationItem, approve: boolean, text?: string) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await resolveJustification(item.id, approve, text);
      close();
      await load();
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudo resolver la justificación."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const reject = async (event: FormEvent) => {
    event.preventDefault();

    if (target) await resolve(target, false, note.trim());
  };

  return (
    <Container className="py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Heading as="h3" className="text-gray-900">
            Justificaciones de faltas
          </Heading>
          <Text variant="small" className="mt-1 text-gray-600">
            Solicitudes enviadas por los representantes. Una falta aprobada deja de
            contar para el límite de faltas injustificadas.
          </Text>
        </div>

        <div className="w-52">
          <Label htmlFor="justification-status">Estado</Label>
          <Select
            id="justification-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as JustificationStatus)}
          >
            {(Object.keys(JUSTIFICATION_LABELS) as JustificationStatus[]).map((value) => (
              <option key={value} value={value}>
                {JUSTIFICATION_LABELS[value]}
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

      <div className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white">
        {isLoading ? (
          <div className="px-6 py-10 text-center">
            <Text variant="small">Cargando...</Text>
          </div>
        ) : null}

        {!isLoading
          ? items.map((item) => (
              <div key={item.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="min-w-[14rem] flex-1">
                    <Text variant="small" className="font-medium text-gray-900">
                      {item.studentName}
                    </Text>
                    <Text variant="caption" className="text-gray-500">
                      {item.courseName} · {item.sessionDate}
                    </Text>
                  </div>
                  <Badge tone={TONE[item.status]}>{JUSTIFICATION_LABELS[item.status]}</Badge>

                  {canResolve && item.status === "PENDING" ? (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        className="px-3 py-1.5 text-sm"
                        disabled={isSubmitting}
                        onClick={() => void resolve(item, true)}
                      >
                        Aprobar
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="px-3 py-1.5 text-sm"
                        disabled={isSubmitting}
                        onClick={() => setTarget(item)}
                      >
                        Rechazar
                      </Button>
                    </div>
                  ) : null}
                </div>
                <Text variant="small" className="mt-2 text-gray-700">
                  Motivo: {item.reason}
                </Text>
                {item.resolutionNote ? (
                  <Text variant="caption" className="mt-1 text-gray-500">
                    Resolución: {item.resolutionNote}
                  </Text>
                ) : null}
              </div>
            ))
          : null}

        {!isLoading && items.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <Text variant="small" className="text-gray-600">
              No hay justificaciones en este estado.
            </Text>
          </div>
        ) : null}
      </div>

      <Modal isOpen={Boolean(target)} onClose={close} ariaLabel="Rechazar justificación">
        <form
          onSubmit={reject}
          className="w-full max-w-md space-y-5 rounded-2xl bg-white p-6 shadow-xl"
        >
          <div>
            <Heading as="h4" className="text-gray-900">
              Rechazar justificación
            </Heading>
            <Text variant="caption" className="mt-1 text-gray-600">
              {target?.studentName} · {target?.courseName} · {target?.sessionDate}
            </Text>
          </div>
          <div>
            <Label htmlFor="reject-note">Motivo del rechazo</Label>
            <Textarea
              id="reject-note"
              rows={3}
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={close}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting} disabled={note.trim().length < 3}>
              Rechazar
            </Button>
          </div>
        </form>
      </Modal>
    </Container>
  );
}
