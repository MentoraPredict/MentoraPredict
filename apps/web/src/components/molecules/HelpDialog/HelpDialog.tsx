import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

import Button from "@/components/atoms/Button";
import Heading from "@/components/atoms/Heading";
import Text from "@/components/atoms/Text";

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/30 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Centro de ayuda"
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <Heading as="h4" className="text-gray-900">
              Centro de ayuda
            </Heading>

            <Text variant="small" className="mt-3">
              Aquí aparecerá información de ayuda para orientar al usuario
              dentro de MentoraPredict.
            </Text>

            <div className="mt-6 flex justify-end">
              <Button type="button" onClick={onClose}>
                Entendido
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
