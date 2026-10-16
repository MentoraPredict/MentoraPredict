import { useEffect, useState } from "react";
import { FiCheck } from "react-icons/fi";

import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import WasmConfettiBurst from "@/components/molecules/WasmConfettiBurst";

interface SurveyCompletionScreenProps {
  completedAt: string;
  durationMinutes: number;
  onBackToSurveys: () => void;
}

export default function SurveyCompletionScreen({
  completedAt,
  durationMinutes,
  onBackToSurveys,
}: SurveyCompletionScreenProps) {
  const [confettiKey, setConfettiKey] = useState(0);

  useEffect(() => {
    setConfettiKey(1);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-10 text-center">
      <WasmConfettiBurst triggerKey={confettiKey} />

      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <FiCheck size={40} />
      </div>

      <div>
        <Heading as="h3" className="text-gray-900">
          ¡Encuesta completada!
        </Heading>
        <Text variant="small" className="mx-auto mt-2 max-w-md text-gray-600">
          Gracias por tu tiempo y honestidad. Tu información nos ayudará a
          brindarte el mejor acompañamiento.
        </Text>
      </div>

      <div className="w-full max-w-sm space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-5 text-left">
        <Text variant="caption" className="font-bold uppercase text-gray-500">
          Resumen de tu respuesta
        </Text>

        <div className="flex items-center justify-between">
          <Text variant="small" className="text-gray-600">
            Fecha completada
          </Text>
          <Text variant="small" className="font-semibold text-gray-900">
            {new Date(completedAt).toLocaleString("es-EC", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </Text>
        </div>

        <div className="flex items-center justify-between">
          <Text variant="small" className="text-gray-600">
            Duración
          </Text>
          <Text variant="small" className="font-semibold text-gray-900">
            {durationMinutes} min
          </Text>
        </div>

        <div className="flex items-center justify-between">
          <Text variant="small" className="text-gray-600">
            Estado
          </Text>
          <Badge tone="green">Completada</Badge>
        </div>
      </div>

      <Button type="button" onClick={onBackToSurveys} className="px-6 py-3 text-sm">
        Ver mis encuestas
      </Button>
    </div>
  );
}
