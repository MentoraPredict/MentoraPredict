import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import RatingScale from "@/components/molecules/RatingScale";
import StudentMetricCard from "@/features/students/components/StudentMetricCard";

interface StudentCourseMetricsPanelProps {
  attendance: number;
  taskCompletion: number;
  emotionalState: number;
  onChangeAttendance: (value: number) => void;
  onChangeTaskCompletion: (value: number) => void;
  onChangeEmotionalState: (value: number) => void;
}

export default function StudentCourseMetricsPanel({
  attendance,
  taskCompletion,
  emotionalState,
  onChangeAttendance,
  onChangeTaskCompletion,
  onChangeEmotionalState,
}: StudentCourseMetricsPanelProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <Heading as="h5" className="text-blue-700">
          Asistencia y cumplimiento
        </Heading>
        <Text variant="small" className="mt-2 text-gray-600">
          Registra indicadores semanales para mejorar el seguimiento de riesgo
          academico.
        </Text>
      </div>

      <div className="space-y-7">
        <StudentMetricCard
          label="Asistencia considerada"
          value={attendance}
          suffix="%"
          max={100}
          onChange={onChangeAttendance}
        />

        <StudentMetricCard
          label="Cumplimiento de tareas"
          value={taskCompletion}
          suffix="%"
          max={100}
          onChange={onChangeTaskCompletion}
        />

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <Text variant="small" className="mb-4 font-semibold text-gray-900">
            Como te sientes con la materia
          </Text>

          <RatingScale
            value={emotionalState}
            onChange={onChangeEmotionalState}
          />

          <div className="mt-2 flex items-center justify-between">
            <Text variant="caption" className="text-gray-400">
              Muy bajo
            </Text>
            <Text variant="caption" className="text-gray-400">
              Muy alto
            </Text>
          </div>
        </div>
      </div>
    </section>
  );
}
