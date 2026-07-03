import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";

interface StudentEnrollmentCellProps {
  isEnrolled: boolean;
  isUpdating?: boolean;
  onStatusChange?: () => void;
}

export default function StudentEnrollmentCell({
  isEnrolled,
  isUpdating = false,
  onStatusChange,
}: StudentEnrollmentCellProps) {
  return (
    <div className="flex items-center gap-3">
      <Badge>{isEnrolled ? "Matriculado" : "Retirado"}</Badge>
      <Button
        type="button"
        variant="outline"
        disabled={isUpdating}
        onClick={onStatusChange}
        className="px-3 py-1.5 text-xs"
      >
        {isUpdating
          ? "Actualizando..."
          : isEnrolled
            ? "Retirar"
            : "Reactivar"}
      </Button>
    </div>
  );
}
