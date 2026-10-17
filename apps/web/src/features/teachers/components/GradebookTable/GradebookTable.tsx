import Badge from "@/components/atoms/Badge";
import Text from "@/components/atoms/Text";

import type { Gradebook } from "@/types/academic/grading.types";

interface GradebookTableProps {
  gradebook: Gradebook;
  isReadOnly: boolean;
  cellValue: (studentId: string, activityId: string) => string;
  isInvalid: (studentId: string, activityId: string) => boolean;
  onChange: (studentId: string, activityId: string, text: string) => void;
  onArchive: (activityId: string) => void;
}

const format = (value: number | null | undefined, decimals: number) =>
  value === null || value === undefined ? "—" : value.toFixed(decimals);

export default function GradebookTable({
  gradebook,
  isReadOnly,
  cellValue,
  isInvalid,
  onChange,
  onArchive,
}: GradebookTableProps) {
  const { components, activities, students, scale } = gradebook;
  const bandLabel = new Map(scale.bands.map((band) => [band.code, band.label]));

  const groups = components.map((component) => ({
    component,
    activities: activities.filter((a) => a.componentCode === component.code),
  }));

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
      <table className="w-full min-w-[40rem] text-left text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th rowSpan={2} className="sticky left-0 z-10 bg-gray-50 px-4 py-3 font-medium">
              Estudiante
            </th>
            {groups.map(({ component, activities: list }) => (
              <th
                key={component.code}
                colSpan={Math.max(list.length, 1) + 1}
                className="border-l border-gray-200 px-4 py-2 text-center font-medium"
              >
                {component.name} · {component.weight}%
              </th>
            ))}
            <th rowSpan={2} className="border-l border-gray-200 px-4 py-3 text-center font-medium">
              Nota del periodo
            </th>
          </tr>
          <tr>
            {groups.map(({ component, activities: list }) => (
              <HeaderCells
                key={component.code}
                activities={list}
                isReadOnly={isReadOnly}
                onArchive={onArchive}
              />
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {students.map((student) => (
            <tr key={student.studentId}>
              <td className="sticky left-0 z-10 bg-white px-4 py-2 font-medium text-gray-900">
                {student.name}
              </td>

              {groups.map(({ component, activities: list }) => (
                <GroupCells
                  key={component.code}
                  list={list}
                  average={student.componentAverages[component.code]}
                  decimals={scale.decimals}
                  studentId={student.studentId}
                  isReadOnly={isReadOnly}
                  cellValue={cellValue}
                  isInvalid={isInvalid}
                  onChange={onChange}
                />
              ))}

              <td className="border-l border-gray-200 px-4 py-2 text-center">
                <span
                  className={`font-semibold ${
                    student.periodGrade !== null && student.periodGrade < scale.passingGrade
                      ? "text-red-700"
                      : "text-gray-900"
                  }`}
                >
                  {format(student.periodGrade, scale.decimals)}
                </span>
                {student.bandCode ? (
                  <div className="mt-1 flex justify-center">
                    <Badge tone={student.isComplete ? "blue" : "neutral"}>
                      {bandLabel.get(student.bandCode) ?? student.bandCode}
                      {student.isComplete ? "" : " (parcial)"}
                    </Badge>
                  </div>
                ) : null}
              </td>
            </tr>
          ))}

          {students.length === 0 ? (
            <tr>
              <td colSpan={99} className="px-4 py-8 text-center">
                <Text variant="small" className="text-gray-600">
                  Este curso aún no tiene estudiantes matriculados.
                </Text>
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

interface HeaderCellsProps {
  activities: Gradebook["activities"];
  isReadOnly: boolean;
  onArchive: (activityId: string) => void;
}

function HeaderCells({ activities, isReadOnly, onArchive }: HeaderCellsProps) {
  return (
    <>
      {activities.length === 0 ? (
        <th className="border-l border-gray-200 px-3 py-2 text-xs font-normal text-gray-500">
          Sin actividades
        </th>
      ) : (
        activities.map((activity, index) => (
          <th
            key={activity.id}
            className={`px-3 py-2 text-center text-xs font-medium ${
              index === 0 ? "border-l border-gray-200" : ""
            }`}
          >
            <span className="block max-w-[8rem] truncate" title={activity.name}>
              {activity.name}
            </span>
            {isReadOnly ? null : (
              <button
                type="button"
                className="mt-0.5 text-[11px] font-normal text-gray-400 hover:text-red-600"
                onClick={() => onArchive(activity.id)}
              >
                Archivar
              </button>
            )}
          </th>
        ))
      )}
      <th className="bg-gray-100/70 px-3 py-2 text-center text-xs font-medium text-gray-700">
        Promedio
      </th>
    </>
  );
}

interface GroupCellsProps {
  list: Gradebook["activities"];
  average: number | null | undefined;
  decimals: number;
  studentId: string;
  isReadOnly: boolean;
  cellValue: (studentId: string, activityId: string) => string;
  isInvalid: (studentId: string, activityId: string) => boolean;
  onChange: (studentId: string, activityId: string, text: string) => void;
}

function GroupCells({
  list,
  average,
  decimals,
  studentId,
  isReadOnly,
  cellValue,
  isInvalid,
  onChange,
}: GroupCellsProps) {
  return (
    <>
      {list.length === 0 ? <td className="border-l border-gray-200 px-3 py-2" /> : null}

      {list.map((activity, index) => (
        <td
          key={activity.id}
          className={`px-2 py-1.5 text-center ${index === 0 ? "border-l border-gray-200" : ""}`}
        >
          <input
            inputMode="decimal"
            aria-label={`Nota de ${activity.name}`}
            disabled={isReadOnly}
            value={cellValue(studentId, activity.id)}
            onChange={(e) => onChange(studentId, activity.id, e.target.value)}
            className={`w-16 rounded-lg border px-2 py-1.5 text-center text-sm outline-none transition disabled:bg-gray-50 disabled:text-gray-500 ${
              isInvalid(studentId, activity.id)
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-blue-700"
            }`}
          />
        </td>
      ))}

      <td className="bg-gray-100/70 px-3 py-2 text-center font-medium text-gray-700">
        {format(average, decimals)}
      </td>
    </>
  );
}
