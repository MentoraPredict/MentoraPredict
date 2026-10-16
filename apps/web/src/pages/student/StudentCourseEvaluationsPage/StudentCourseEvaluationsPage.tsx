import { FiClipboard } from "react-icons/fi";

import ComingSoonSection from "@/features/students/components/ComingSoonSection";

export default function StudentCourseEvaluationsPage() {
  return (
    <ComingSoonSection
      icon={FiClipboard}
      title="Evaluaciones"
      description="Aquí podrás ver tus calificaciones y el detalle de cada evaluación de esta materia."
    />
  );
}
