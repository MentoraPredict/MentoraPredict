import { FiAlertTriangle } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import Modal from "@/components/molecules/Modal";

interface AdminUserRestrictionDialogProps {
  message: string | null;
  onClose: () => void;
}

export default function AdminUserRestrictionDialog({
  message,
  onClose,
}: AdminUserRestrictionDialogProps) {
  return (
    <Modal
      isOpen={Boolean(message)}
      ariaLabel="Operación de usuario no permitida"
      onClose={onClose}
    >
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <FiAlertTriangle size={28} aria-hidden="true" />
        </div>

        <Heading as="h4" className="mt-4 text-gray-900">
          No se puede realizar esta acción
        </Heading>

        <Text variant="small" className="mt-3 text-gray-600">
          {message}
        </Text>

        <Button type="button" className="mt-6" onClick={onClose}>
          Entendido
        </Button>
      </div>
    </Modal>
  );
}
