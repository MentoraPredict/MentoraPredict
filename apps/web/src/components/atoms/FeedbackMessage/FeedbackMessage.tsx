import { AnimatePresence, motion } from "framer-motion";

type FeedbackTone = "error" | "success" | "info";

interface FeedbackMessageProps {
  className?: string;
  message?: string;
  tone?: FeedbackTone;
}

const toneClasses: Record<FeedbackTone, string> = {
  error: "text-red-500",
  success: "text-green-700",
  info: "text-blue-700",
};

export default function FeedbackMessage({
  className,
  message,
  tone = "info",
}: FeedbackMessageProps) {
  const classes = ["text-sm", toneClasses[tone], className]
    .filter(Boolean)
    .join(" ");

  return (
    <AnimatePresence initial={false} mode="wait">
      {message ? (
        <motion.p
          key={`${tone}-${message}`}
          role={tone === "error" ? "alert" : "status"}
          aria-live={tone === "error" ? "assertive" : "polite"}
          className={classes}
          initial={{ height: 0, opacity: 0, y: -6 }}
          animate={{ height: "auto", opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, y: -4 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {message}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}
