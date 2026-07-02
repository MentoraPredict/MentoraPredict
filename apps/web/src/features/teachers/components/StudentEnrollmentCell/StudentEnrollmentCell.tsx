import Badge from "@/components/atoms/Badge";
import Text from "@/components/atoms/Text";

interface StudentEnrollmentCellProps {
  isEnrolled: boolean;
  onUnenroll?: () => void;
}

export default function StudentEnrollmentCell({
  isEnrolled,
  onUnenroll,
}: StudentEnrollmentCellProps) {
  if (!isEnrolled) {
    return (
      <Text variant="caption" className="font-semibold text-gray-500">
        No matriculado
      </Text>
    );
  }

  return (
    <button
      type="button"
      onClick={onUnenroll}
      className="
                group
                inline-flex
                min-w-32
                items-center
                justify-center
            "
    >
      <span className="group-hover:hidden">
        <Badge>Matriculado</Badge>
      </span>

      <span className="hidden group-hover:block">
        <Text variant="caption" className="font-semibold text-red-700">
          Desmatricular
        </Text>
      </span>
    </button>
  );
}
