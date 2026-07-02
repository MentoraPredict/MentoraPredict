import Badge from "@/components/atoms/Badge";
import Text from "@/components/atoms/Text";

interface AdminUserStatusCellProps {
  isActive?: boolean;
  onToggleStatus?: () => void;
}

export default function AdminUserStatusCell({
  isActive = false,
  onToggleStatus,
}: AdminUserStatusCellProps) {
  return (
    <button
      type="button"
      onClick={onToggleStatus}
      className="
                group
                inline-flex
                min-w-28
                items-center
                justify-center
            "
    >
      <span className="group-hover:hidden">
        <Badge>{isActive ? "Activo" : "Inactivo"}</Badge>
      </span>

      <span className="hidden group-hover:block">
        <Text variant="caption" className="font-semibold text-blue-700">
          {isActive ? "Desactivar" : "Activar"}
        </Text>
      </span>
    </button>
  );
}
