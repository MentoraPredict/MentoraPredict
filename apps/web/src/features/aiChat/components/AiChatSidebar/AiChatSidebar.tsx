import { FiMessageSquare, FiPlus } from "react-icons/fi";

import Text from "@/components/atoms/Text";
import type { AiConversation } from "@/features/aiChat/types";

interface AiChatSidebarProps {
  conversations: AiConversation[];
  activeConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onNewConversation: () => void;
}

export default function AiChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
}: AiChatSidebarProps) {
  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="p-4">
        <button
          type="button"
          onClick={onNewConversation}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-800"
        >
          <FiPlus size={16} />
          Nueva conversación
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        <Text variant="caption" className="px-2 pb-2 font-bold uppercase text-gray-400">
          Historial
        </Text>

        <div className="space-y-1">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => {
                onSelectConversation(conversation.id);
              }}
              className={`flex w-full items-start gap-2 rounded-xl px-3 py-2.5 text-left transition ${
                activeConversationId === conversation.id
                  ? "bg-blue-50 text-blue-800"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FiMessageSquare size={16} className="mt-0.5 shrink-0" />
              <span className="min-w-0">
                <Text variant="small" className="truncate font-medium">
                  {conversation.title}
                </Text>
                <Text variant="caption" className="text-gray-400">
                  {new Date(conversation.createdAt).toLocaleDateString("es-EC", {
                    day: "2-digit",
                    month: "short",
                  })}
                </Text>
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
