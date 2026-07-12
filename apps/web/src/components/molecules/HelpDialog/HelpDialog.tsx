import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import type { UserRole } from "@/types/user/role.types";

const HELP_BY_ROLE: Record<
  UserRole,
  { title: string; description: string; capabilities: string[] }
> = {
  ADMIN: {
    title: "Ayuda para administradores",
    description:
      "Como administrador puedes configurar la estructura académica y gestionar a los usuarios de MentoraPredict.",
    capabilities: [
      "Crear, consultar y editar usuarios administradores, docentes y estudiantes.",
      "Activar o desactivar cuentas respetando sus dependencias académicas.",
      "Cambiar usuarios entre los roles de estudiante y docente cuando no tengan cursos activos.",
      "Crear y administrar cursos, asignar docentes y gestionar estudiantes matriculados.",
      "Consultar el temario, la información y el estado de los cursos.",
      "Actualizar tu información y fotografía desde el perfil administrativo.",
    ],
  },
  TEACHER: {
    title: "Ayuda para docentes",
    description:
      "Como docente puedes organizar tus cursos y dar seguimiento al desempeño de tus estudiantes.",
    capabilities: [
      "Consultar los cursos que tienes asignados y editar su información disponible.",
      "Revisar y gestionar los estudiantes matriculados en cada curso.",
      "Registrar o importar calificaciones y administrar evaluaciones.",
      "Consultar el promedio, progreso, alertas y niveles de riesgo del curso.",
      "Gestionar el temario y los recursos académicos de tus cursos.",
      "Revisar notificaciones y actualizar la información de tu perfil.",
    ],
  },
  STUDENT: {
    title: "Ayuda para estudiantes",
    description:
      "Como estudiante puedes consultar tus cursos y seguir tu evolución académica desde un solo lugar.",
    capabilities: [
      "Consultar las materias en las que estás matriculado.",
      "Revisar tus calificaciones, promedio y progreso semanal por curso.",
      "Conocer tu nivel de riesgo, alertas y factores que afectan tu rendimiento.",
      "Registrar tus seguimientos semanales cuando estén disponibles.",
      "Consultar recomendaciones y predicciones para mejorar tu desempeño.",
      "Revisar notificaciones y actualizar la información de tu perfil.",
    ],
  },
};

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
  role?: UserRole;
}

export default function HelpDialog({ isOpen, onClose, role }: HelpDialogProps) {
  const help = role ? HELP_BY_ROLE[role] : null;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/30 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Centro de ayuda"
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <Heading as="h4" className="text-gray-900">
              Centro de ayuda
            </Heading>

            {help ? (
              <div className="mt-4">
                <Heading as="h6" className="text-blue-700">
                  {help.title}
                </Heading>

                <Text variant="small" className="mt-2 text-gray-600">
                  {help.description}
                </Text>

                <ul className="mt-5 space-y-3">
                  {help.capabilities.map((capability) => (
                    <li key={capability} className="flex items-start gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-600"
                      />
                      <Text variant="small" className="text-gray-700">
                        {capability}
                      </Text>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <Text variant="small" className="mt-3 text-gray-600">
                Inicia sesión para consultar la guía correspondiente a tu rol.
              </Text>
            )}

            <div className="mt-6 flex justify-end">
              <Button type="button" onClick={onClose}>
                Entendido
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
