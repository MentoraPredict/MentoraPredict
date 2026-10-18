import Badge from "@/components/atoms/Badge";

interface AdminUserStatusCellProps {
  isActive?: boolean;
}

/** Solo muestra el estado; para cambiarlo se usa la vista de edición. */
export default function AdminUserStatusCell({
  isActive = false,
}: AdminUserStatusCellProps) {
  return (
    <Badge tone={isActive ? "blue" : "red"} className="min-w-20">
      {isActive ? "Activo" : "Inactivo"}
    </Badge>
  );
}
