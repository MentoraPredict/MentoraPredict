import FeedbackMessage from "@/components/atoms/FeedbackMessage";

interface ErrorMessageProps {
  message?: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return <FeedbackMessage message={message} tone="error" className="mt-1" />;
}
