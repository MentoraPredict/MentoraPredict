import Badge from "@/components/atoms/Badge";
import Text from "@/components/atoms/Text";
import Pagination from "@/components/molecules/Pagination";
import usePagination from "@/hooks/usePagination";
import type {
  StudentCheckInEmotionalState,
  StudentCheckInResponse,
} from "@/services/academic.service";

const CHECK_INS_PER_PAGE = 8;

const EMOTIONAL_LABELS: Record<StudentCheckInEmotionalState, string> = {
  CRITICAL: "Muy mal",
  BAD: "Mal",
  NEUTRAL: "Regular",
  GOOD: "Bien",
  GREAT: "Muy bien",
};

const headerCellClassName =
  "px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-500";

const dateFormatter = new Intl.DateTimeFormat("es-EC", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

interface StudentCheckInHistoryProps {
  checkIns: StudentCheckInResponse[];
}

/** Avances ya registrados en la materia, con la fecha de cada uno. */
export default function StudentCheckInHistory({ checkIns }: StudentCheckInHistoryProps) {
  const {
    currentPage,
    paginatedItems,
    totalItems,
    totalPages,
    setCurrentPage,
  } = usePagination(checkIns, CHECK_INS_PER_PAGE, checkIns.length);

  return (
    <div className="space-y-4">
      <Pagination
        currentPage={currentPage}
        pageSize={CHECK_INS_PER_PAGE}
        totalItems={totalItems}
        totalPages={totalPages}
        itemLabel="avances"
        onPageChange={setCurrentPage}
      />

      <div className="min-w-0 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className={headerCellClassName}>Fecha</th>
              <th className={headerCellClassName}>Semana</th>
              <th className={headerCellClassName}>Asistencia</th>
              <th className={headerCellClassName}>Tareas</th>
              <th className={headerCellClassName}>Estudio</th>
              <th className={headerCellClassName}>Ánimo</th>
              <th className={headerCellClassName}>Comprensión</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedItems.map((checkIn, index) => (
              <tr key={checkIn.id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {dateFormatter.format(new Date(checkIn.checkInDate))}
                  {currentPage === 1 && index === 0 ? (
                    <Badge tone="blue" className="ml-2">
                      Último
                    </Badge>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-gray-700">{checkIn.academicWeek}</td>
                <td className="px-4 py-3 text-gray-700">{checkIn.attendance}%</td>
                <td className="px-4 py-3 text-gray-700">{checkIn.taskCompletion}%</td>
                <td className="px-4 py-3 text-gray-700">
                  {Number(checkIn.studyHours)} h
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {EMOTIONAL_LABELS[checkIn.emotionalState]}
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {Math.round(checkIn.generalComprehension)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Text variant="caption" className="text-gray-500">
        Se guarda un avance por semana: si registras otro en la misma semana, se
        actualiza el que ya tienes.
      </Text>
    </div>
  );
}
