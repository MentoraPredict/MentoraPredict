import { motion } from "framer-motion";
import { FiCpu } from "react-icons/fi";

interface WasmConfettiTriggerProps {
  onTrigger: () => void;
}

export default function WasmConfettiTrigger({ onTrigger }: WasmConfettiTriggerProps) {
  return (
    <button
      type="button"
      onClick={onTrigger}
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        bg-blue-100
        px-3
        py-1
        text-xs
        font-semibold
        text-blue-700
        transition
        hover:bg-blue-200
      "
    >
      <motion.span
        className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-700 text-white"
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <FiCpu size={10} />
      </motion.span>
      Calculado con WebAssembly
    </button>
  );
}
