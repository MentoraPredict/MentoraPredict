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
    <section
      className="
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-6
                shadow-sm
            "
    >
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

        <div>
          <Text variant="small" className="mb-4 font-semibold text-gray-900">
            ¿Cómo te sientes con la materia?
          </Text>

          <RatingScale
            value={emotionalState}
            onChange={onChangeEmotionalState}
          />
        </div>
      </div>
    </section>
  );
}
