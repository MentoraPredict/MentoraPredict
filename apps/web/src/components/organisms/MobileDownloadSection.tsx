import { useEffect, useMemo, useState } from "react";
import { FaAndroid, FaDownload, FaExternalLinkAlt } from "react-icons/fa";

import Button from "@/components/atoms/Button";
import Container from "@/components/atoms/Container";

interface MobileApkManifest {
  environment?: string;
  downloadUrl?: string;
  buildUrl?: string;
  updatedAt?: string;
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

export default function MobileDownloadSection() {
  const [manifest, setManifest] = useState<MobileApkManifest | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetch("/mobile-apk.json", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("APK manifest not available");
        }

        return response.json() as Promise<MobileApkManifest>;
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
  }, []);

  const hasDownload = Boolean(manifest?.downloadUrl);
  const environmentLabel = useMemo(() => {
    const environment = manifest?.environment?.toUpperCase();
    return environment && environment !== "LOCAL" ? environment : "Proximamente";
  }, [manifest?.environment]);

  return (
    <section
      id="mobile-app"
      className="bg-white py-14 sm:py-16"
      aria-labelledby="mobile-app-title"
    >
      <Container>
        <div className="grid items-center gap-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-6 shadow-sm md:grid-cols-[1.15fr_0.85fr] md:p-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-blue-800">
              <FaAndroid size={14} aria-hidden="true" />
              Aplicacion Android
            </span>

            <h2
              id="mobile-app-title"
              className="mt-4 text-2xl font-extrabold leading-tight text-gray-950 sm:text-3xl"
            >
              Prueba MentoraPredict desde el APK interno.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)] sm:text-base">
              Descarga la version Android generada desde el pipeline. El enlace
              se puede publicar manualmente cuando el APK este listo.
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
                Descargar APK
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
                  {hasDownload ? "APK disponible" : "Esperando primer build"}
                </dd>
              </div>

              <div>
                <dt className="font-semibold text-gray-500">Ambiente</dt>
                <dd className="mt-1 font-bold text-gray-950">
                  {environmentLabel}
                </dd>
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
      </Container>
    </section>
  );
}
