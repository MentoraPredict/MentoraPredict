import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import Textarea from "@/components/atoms/Textarea";
import RatingScale from "@/components/molecules/RatingScale";
import StudentMetricCard from "@/features/students/components/StudentMetricCard";

interface StudentStudyHabitsPanelProps {
  studyHours: number;
  skillsText: string;
  comprehensionLevel: number;
  onChangeStudyHours: (value: number) => void;
  onChangeSkillsText: (value: string) => void;
  onChangeComprehensionLevel: (value: number) => void;
}

export default function StudentStudyHabitsPanel({
  studyHours,
  skillsText,
  comprehensionLevel,
  onChangeStudyHours,
  onChangeSkillsText,
  onChangeComprehensionLevel,
}: StudentStudyHabitsPanelProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <Heading as="h5" className="text-blue-700">
          Habitos de estudio
        </Heading>
        <Text variant="small" className="mt-2 text-gray-600">
          Comparte senales de esfuerzo, comprension y habilidades para mejorar
          las recomendaciones.
        </Text>
      </div>

      <div className="space-y-6">
        <StudentMetricCard
          label="Promedio de horas de estudio"
          value={studyHours}
          suffix="h"
          max={8}
          onChange={onChangeStudyHours}
        />

        <div>
          <Text variant="small" className="mb-2 font-semibold text-gray-900">
            Habilidades o temas que quieres reforzar
          </Text>

          <Textarea
            rows={4}
            value={skillsText}
            onChange={(event) => {
              onChangeSkillsText(event.target.value);
            }}
            placeholder="Ejemplo: necesito practicar derivadas, lectura de graficas o resolucion de problemas."
          />
        </div>

        <div>
          <Text variant="small" className="mb-4 font-semibold text-gray-900">
            Nivel de comprension de la materia
          </Text>

          <RatingScale
            value={comprehensionLevel}
            onChange={onChangeComprehensionLevel}
          />
        </div>
      </div>
    </section>
  );
}
