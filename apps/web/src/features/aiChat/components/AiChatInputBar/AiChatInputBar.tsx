import { FiSend } from "react-icons/fi";

interface AiChatInputBarProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

export default function AiChatInputBar({
  value,
  onChange,
  onSend,
  disabled = false,
}: AiChatInputBarProps) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!value.trim() || disabled) return;
    onSend();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 border-t border-gray-200 bg-white p-4"
    >
      <input
        type="text"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder="Escribe tu pregunta..."
        disabled={disabled}
        className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none disabled:bg-gray-50"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FiSend size={16} />
      </button>
    </form>
  );
}
