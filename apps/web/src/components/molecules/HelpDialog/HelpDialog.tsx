import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/30
                px-4
            "
    >
      <div
        className="
                    w-full
                    max-w-md
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    p-6
                    shadow-lg
                "
      >
        <Heading as="h4" className="text-gray-900">
          Centro de ayuda
        </Heading>

        <Text variant="small" className="mt-3">
          Aquí aparecerá información de ayuda para orientar al usuario dentro de
          MentoraPredict.
        </Text>

        <div className="mt-6 flex justify-end">
          <Button type="button" onClick={onClose}>
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
}
