import { FiUserX } from "react-icons/fi";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";
import Modal from "@/components/molecules/Modal";

interface DisabledAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DisabledAccountDialog({
  isOpen,
  onClose,
}: DisabledAccountDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      ariaLabel="Cuenta desactivada"
      onClose={onClose}
    >
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-700">
          <FiUserX size={28} aria-hidden="true" />
        </div>

        <Heading as="h4" className="mt-4 text-gray-900">
          Cuenta desactivada
        </Heading>

        <Text variant="small" className="mt-3 text-gray-600">
          Tu cuenta ha sido desactivada. Comunícate con un administrador para
          solicitar ayuda o recuperar el acceso.
        </Text>

        <Button type="button" className="mt-6" onClick={onClose}>
          Entendido
        </Button>
      </div>
    </Modal>
  );
}
