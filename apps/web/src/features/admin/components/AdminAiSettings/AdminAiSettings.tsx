import { FormEvent, useState } from "react";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";
import Heading from "@/components/atoms/Heading";
import Input from "@/components/atoms/Input";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import Text from "@/components/atoms/Text";

import useAdminAiSettings from "@/features/admin/hooks/useAdminAiSettings";
import { AI_SOURCE_LABELS } from "@/types/academic/ai-settings.types";

const RANGES = [7, 30, 90];

const number = new Intl.NumberFormat("es-EC");

function formatDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("es-EC", { dateStyle: "short", timeStyle: "short" });
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
      <Text variant="caption" className="font-semibold uppercase tracking-[0.12em] text-gray-500">
        {label}
      </Text>
      <Text variant="small" className="mt-1 text-lg font-semibold text-gray-900">
        {value}
      </Text>
    </div>
  );
}

export default function AdminAiSettings() {
  const ai = useAdminAiSettings();
  const { settings, usage } = ai;

  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState<string | null>(null);

  const modelValue = model ?? settings?.model ?? "";
  const hasNewKey = apiKey.trim().length > 0;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const ok = await ai.save({
      ...(hasNewKey ? { apiKey: apiKey.trim() } : {}),
      model: modelValue.trim(),
    });
    if (ok) {
      setApiKey("");
      setModel(null);
    }
  };

  const toggleEnabled = () => {
    if (settings) void ai.save({ enabled: !settings.enabled });
  };

  const maxDayTokens = Math.max(1, ...(usage?.byDay.map((day) => day.totalTokens) ?? [1]));

  return (
    <Container className="py-8">
      <div className="mb-6">
        <Heading as="h3" className="text-gray-900">
          Inteligencia artificial
        </Heading>
        <Text variant="small" className="mt-1 text-gray-600">
          Clave de OpenAI y modelo con los que se generan las recomendaciones. Si la IA está
          apagada o sin clave, el sistema usa recomendaciones por reglas.
        </Text>
      </div>

      {ai.error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <Text variant="small" className="font-medium text-red-700">
            {ai.error}
          </Text>
        </div>
      ) : null}

      {ai.isLoading ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center">
          <Text variant="small">Cargando...</Text>
        </div>
      ) : null}

      {settings ? (
        <>
          <form
            onSubmit={handleSubmit}
            className="mb-6 rounded-2xl border border-gray-200 bg-white p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Heading as="h5" className="text-gray-900">
                Conexión con OpenAI
              </Heading>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={settings.configured ? "green" : "amber"}>
                  {AI_SOURCE_LABELS[settings.source]}
                </Badge>
                <Badge tone={settings.enabled ? "blue" : "neutral"}>
                  {settings.enabled ? "IA activada" : "IA apagada"}
                </Badge>
              </div>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <Label htmlFor="ai-api-key">Clave de API</Label>
                <Input
                  id="ai-api-key"
                  type="password"
                  autoComplete="off"
                  value={apiKey}
                  placeholder={
                    settings.keyLast4
                      ? `Guardada: sk-…${settings.keyLast4}. Escribe otra para reemplazarla`
                      : "sk-..."
                  }
                  onChange={(event) => setApiKey(event.target.value)}
                />
                <Text variant="caption" className="mt-1 text-gray-500">
                  Se guarda cifrada y nunca se vuelve a mostrar completa.
                </Text>
              </div>

              <div>
                <Label htmlFor="ai-model">Modelo</Label>
                <Input
                  id="ai-model"
                  value={modelValue}
                  placeholder={settings.defaultModel}
                  onChange={(event) => setModel(event.target.value)}
                />
                <Text variant="caption" className="mt-1 text-gray-500">
                  Por defecto: {settings.defaultModel}.
                </Text>
              </div>
            </div>

            {ai.actionError ? (
              <p className="mt-4 text-sm font-medium text-red-600">{ai.actionError}</p>
            ) : null}
            {ai.saved ? (
              <p className="mt-4 text-sm font-medium text-emerald-700">Configuración guardada.</p>
            ) : null}

            {ai.connection ? (
              <div
                className={`mt-4 rounded-xl border px-4 py-3 ${
                  ai.connection.ok
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                <Text variant="small" className="font-medium text-current">
                  {ai.connection.message}
                </Text>
                <Text variant="caption" className="mt-1 text-current">
                  {ai.connection.latencyMs} ms
                  {ai.connection.status ? ` · código ${ai.connection.status}` : ""}
                </Text>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap justify-between gap-3">
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={ai.isTesting || (!settings.configured && !hasNewKey)}
                  onClick={() =>
                    void ai.test({
                      ...(hasNewKey ? { apiKey: apiKey.trim() } : {}),
                      ...(modelValue.trim() ? { model: modelValue.trim() } : {}),
                    })
                  }
                >
                  {ai.isTesting ? "Probando..." : "Probar conexión"}
                </Button>
                <Button type="button" variant="outline" disabled={ai.isSaving} onClick={toggleEnabled}>
                  {settings.enabled ? "Apagar IA" : "Encender IA"}
                </Button>
                {settings.source === "database" ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="!border-red-200 !text-red-600 hover:!bg-red-50"
                    disabled={ai.isSaving}
                    onClick={() => void ai.save({ clearApiKey: true })}
                  >
                    Quitar clave guardada
                  </Button>
                ) : null}
              </div>

              <Button type="submit" disabled={ai.isSaving || (!hasNewKey && model === null)}>
                {ai.isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
            <Text variant="caption" className="mt-3 text-gray-500">
              «Probar conexión» consulta el modelo a OpenAI sin generar texto, así que no gasta
              tokens. Si escribes una clave, prueba esa antes de guardarla.
            </Text>
          </form>

          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Heading as="h5" className="text-gray-900">
                  Uso registrado
                </Heading>
                <Text variant="caption" className="mt-1 text-gray-500">
                  Tokens que consumieron las recomendaciones generadas desde esta plataforma. El saldo
                  y el gasto real están en el panel de OpenAI.
                </Text>
              </div>
              <div className="w-40">
                <Select
                  aria-label="Periodo del uso"
                  value={ai.usageDays}
                  onChange={(event) => void ai.changeUsageDays(Number(event.target.value))}
                >
                  {RANGES.map((days) => (
                    <option key={days} value={days}>
                      Últimos {days} días
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {usage ? (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <Stat label="Llamadas" value={number.format(usage.totals.calls)} />
                  <Stat label="Con error" value={number.format(usage.totals.failures)} />
                  <Stat label="Tokens de entrada" value={number.format(usage.totals.promptTokens)} />
                  <Stat label="Tokens de salida" value={number.format(usage.totals.completionTokens)} />
                  <Stat label="Tokens totales" value={number.format(usage.totals.totalTokens)} />
                </div>

                {usage.byDay.length > 0 ? (
                  <div className="mt-6">
                    <Text variant="caption" className="font-semibold uppercase tracking-[0.12em] text-gray-500">
                      Tokens por día
                    </Text>
                    <div className="mt-2 space-y-1.5">
                      {usage.byDay.map((day) => (
                        <div key={day.date} className="flex items-center gap-3">
                          <Text variant="caption" className="w-24 shrink-0 text-gray-600">
                            {day.date}
                          </Text>
                          <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{ width: `${Math.max(2, (day.totalTokens / maxDayTokens) * 100)}%` }}
                            />
                          </div>
                          <Text variant="caption" className="w-28 shrink-0 text-right text-gray-600">
                            {number.format(day.totalTokens)} · {day.calls} llam.
                          </Text>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Text variant="small" className="mt-5 text-gray-600">
                    Todavía no hay llamadas a OpenAI en este periodo.
                  </Text>
                )}

                {usage.byModel.length > 0 ? (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {usage.byModel.map((row) => (
                      <Badge key={row.model} tone="neutral">
                        {row.model}: {number.format(row.totalTokens)} tokens · {row.calls} llam.
                      </Badge>
                    ))}
                  </div>
                ) : null}

                {usage.recent.length > 0 ? (
                  <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full min-w-[34rem] text-left text-sm">
                      <thead className="bg-gray-50 text-xs uppercase tracking-[0.1em] text-gray-500">
                        <tr>
                          <th className="px-3 py-2">Fecha</th>
                          <th className="px-3 py-2">Tipo</th>
                          <th className="px-3 py-2">Modelo</th>
                          <th className="px-3 py-2 text-right">Tokens</th>
                          <th className="px-3 py-2 text-right">Tiempo</th>
                          <th className="px-3 py-2">Resultado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {usage.recent.map((row, index) => (
                          <tr key={`${row.createdAt}-${index}`}>
                            <td className="px-3 py-2 text-gray-700">{formatDateTime(row.createdAt)}</td>
                            <td className="px-3 py-2 text-gray-700">
                              {row.kind === "test" ? "Prueba" : "Recomendación"}
                            </td>
                            <td className="px-3 py-2 text-gray-700">{row.model}</td>
                            <td className="px-3 py-2 text-right text-gray-700">
                              {number.format(row.totalTokens)}
                            </td>
                            <td className="px-3 py-2 text-right text-gray-700">{row.durationMs} ms</td>
                            <td className="px-3 py-2">
                              <Badge tone={row.success ? "green" : "red"}>
                                {row.success ? "Correcto" : (row.error ?? "Error")}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </>
            ) : (
              <Text variant="small" className="mt-5 text-gray-600">
                No se pudo cargar el uso registrado.
              </Text>
            )}
          </section>
        </>
      ) : null}
    </Container>
  );
}