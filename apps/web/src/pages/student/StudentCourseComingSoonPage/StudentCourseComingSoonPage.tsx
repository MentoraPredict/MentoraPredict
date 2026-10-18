import type { IconType } from "react-icons";
import { FiCheckSquare, FiClipboard, FiFolder, FiMessageCircle } from "react-icons/fi";

import ComingSoonSection from "@/features/students/components/ComingSoonSection";

export type StudentCourseComingSoonSection =
  | "activities"
  | "evaluations"
  | "materials"
  | "ai-chat";

const SECTIONS: Record<
  StudentCourseComingSoonSection,
  { icon: IconType; title: string; description: string }
> = {
  activities: {
    icon: FiCheckSquare,
    title: "Actividades y tareas",
    description:
      "Aquí verás las actividades y tareas de esta materia con su fecha de entrega y tu calificación.",
  },
  evaluations: {
    icon: FiClipboard,
    title: "Evaluaciones",
    description:
      "Aquí rendirás las evaluaciones en línea de esta materia y verás su resultado.",
  },
  materials: {
    icon: FiFolder,
    title: "Materiales y temas",
    description:
      "Aquí encontrarás los temas del sílabo de esta materia y los archivos que comparta tu docente.",
  },
  "ai-chat": {
    icon: FiMessageCircle,
    title: "Asistente con IA",
    description:
      "Aquí podrás conversar con un asistente que te ayude a estudiar esta materia. Estará disponible cuando tu representante lo autorice.",
  },
};

interface StudentCourseComingSoonPageProps {
  section: StudentCourseComingSoonSection;
}

/** Pestañas de la materia que aún no tienen función: se muestran como «Próximamente». */
export default function StudentCourseComingSoonPage({
  section,
}: StudentCourseComingSoonPageProps) {
  const { icon, title, description } = SECTIONS[section];

  return <ComingSoonSection icon={icon} title={title} description={description} />;
}