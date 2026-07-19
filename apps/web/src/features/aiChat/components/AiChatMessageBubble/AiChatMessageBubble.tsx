import { FaRobot } from "react-icons/fa";

import Text from "@/components/atoms/Text";
import UserAvatar from "@/components/atoms/UserAvatar";
import { useAuthStore } from "@/store/auth.store";
import type { ChatMessage } from "@/features/aiChat/types";

interface AiChatMessageBubbleProps {
  message: ChatMessage;
}

export default function AiChatMessageBubble({ message }: AiChatMessageBubbleProps) {
  const user = useAuthStore((state) => state.user);
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {isUser ? (
        <UserAvatar
          imageUrl={user?.avatarUrl ?? undefined}
          firstName={user?.firstName}
          lastName={user?.lastName}
          className="shrink-0"
        />
      ) : (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-700 text-white">
          <FaRobot size={16} />
        </div>
      )}

      <div
        className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "rounded-tr-sm bg-blue-700 text-white"
            : "rounded-tl-sm bg-gray-100 text-gray-800"
        }`}
      >
        <Text variant="small" className={isUser ? "!text-white" : "text-gray-800"}>
          {message.content}
        </Text>
      </div>
    </div>
  );
}
