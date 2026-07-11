import { useEffect, useMemo, useState } from "react";
import {
  FaAndroid,
  FaDesktop,
  FaDownload,
  FaExternalLinkAlt,
} from "react-icons/fa";

import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";

interface DownloadManifest {
  environment?: string;
  downloadUrl?: string;
  buildUrl?: string;
  version?: string;
  updatedAt?: string;
}

function useDownloadManifest(fileName: string) {
  const [manifest, setManifest] = useState<DownloadManifest | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch(`/downloads/${fileName}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Download manifest not available");
        }

        return response.json() as Promise<DownloadManifest>;
      })
      .then((data) => {
        if (isMounted) {
          setManifest(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setManifest(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fileName]);

  return manifest;
}

function formatUpdatedAt(value?: string) {
  if (!value) {
    return "Pendiente de publicacion";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

interface PlatformDownloadCardProps {
  icon: React.ReactNode;
  badgeLabel: string;
  title: string;
  description: string;
  downloadLabel: string;
  manifest: DownloadManifest | null;
}

function PlatformDownloadCard({
  icon,
  badgeLabel,
  title,
  description,
  downloadLabel,
  manifest,
}: PlatformDownloadCardProps) {
  const hasDownload = Boolean(manifest?.downloadUrl);
  const environmentLabel = useMemo(() => {
    const environment = manifest?.environment?.toUpperCase();
    return environment && environment !== "LOCAL" ? environment : "Proximamente";
  }, [manifest?.environment]);

  return (
    <div className="grid items-center gap-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-6 shadow-sm md:grid-cols-[1.15fr_0.85fr] md:p-8">
      <div>
        <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-blue-800">
          {icon}
          {badgeLabel}
        </span>

        <h2 className="mt-4 text-2xl font-extrabold leading-tight text-gray-950 sm:text-3xl">
          {title}
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)] sm:text-base">
          {description}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            className="gap-2 rounded-lg bg-blue-700 px-6"
            disabled={!hasDownload}
            onClick={() => {
              if (manifest?.downloadUrl) {
                window.open(manifest.downloadUrl, "_blank", "noopener");
              }
            }}
          >
            <FaDownload size={14} aria-hidden="true" />
            {downloadLabel}
          </Button>

          {manifest?.buildUrl ? (
            <Button
              variant="secondary"
              className="gap-2 rounded-lg px-6"
              onClick={() => {
                window.open(manifest.buildUrl, "_blank", "noopener");
              }}
            >
              Ver build
              <FaExternalLinkAlt size={12} aria-hidden="true" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="rounded-xl border border-white bg-white/85 p-5">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="font-semibold text-gray-500">Estado</dt>
            <dd className="mt-1 font-bold text-gray-950">
              {hasDownload ? "Disponible" : "Esperando primer build"}
            </dd>
          </div>

          <div>
            <dt className="font-semibold text-gray-500">Ambiente</dt>
            <dd className="mt-1 font-bold text-gray-950">{environmentLabel}</dd>
          </div>

          <div>
            <dt className="font-semibold text-gray-500">
              Ultima actualizacion
            </dt>
            <dd className="mt-1 font-bold text-gray-950">
              {formatUpdatedAt(manifest?.updatedAt)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

export default function DownloadsSection() {
  const desktopManifest = useDownloadManifest("desktop.json");
  const mobileManifest = useDownloadManifest("mobile.json");

  return (
    <section
      id="downloads"
      className="bg-white py-14 sm:py-16"
      aria-labelledby="downloads-title"
    >
      <Container>
        <h2 id="downloads-title" className="sr-only">
          Descargas de MentoraPredict
        </h2>

        <div className="grid gap-6 lg:grid-cols-2">
          <PlatformDownloadCard
            icon={<FaDesktop size={14} aria-hidden="true" />}
            badgeLabel="Aplicacion de Escritorio"
            title="Instala MentoraPredict en tu equipo."
            description="Descarga el instalador para Windows generado desde el pipeline. El enlace se puede publicar manualmente cuando el instalador este listo."
            downloadLabel="Descargar para Windows"
            manifest={desktopManifest}
          />

          <PlatformDownloadCard
            icon={<FaAndroid size={14} aria-hidden="true" />}
            badgeLabel="Aplicacion Android"
            title="Prueba MentoraPredict desde el APK interno."
            description="Descarga la version Android generada desde el pipeline. El enlace se puede publicar manualmente cuando el APK este listo."
            downloadLabel="Descargar APK"
            manifest={mobileManifest}
          />
        </div>
      </Container>
    </section>
  );
}
