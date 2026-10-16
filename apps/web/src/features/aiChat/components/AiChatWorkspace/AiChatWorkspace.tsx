import { useEffect, useRef, useState } from "react";

import Heading from "@/components/atoms/Heading";
import AiChatInputBar from "@/features/aiChat/components/AiChatInputBar";
import AiChatMessageBubble from "@/features/aiChat/components/AiChatMessageBubble";
import AiChatResourcesPanel from "@/features/aiChat/components/AiChatResourcesPanel";
import AiChatSidebar from "@/features/aiChat/components/AiChatSidebar";
import AiChatTipsPanel from "@/features/aiChat/components/AiChatTipsPanel";
import AiChatWelcome from "@/features/aiChat/components/AiChatWelcome";
import { MOCK_CONVERSATIONS, getCannedReply } from "@/features/aiChat/mocks/aiChatConversations.mock";
import type { AiConversation, ChatMessage } from "@/features/aiChat/types";

let messageCounter = 0;
function nextMessageId() {
  messageCounter += 1;
  return `msg-${messageCounter}`;
}

export default function AiChatWorkspace() {
  const [conversations, setConversations] = useState<AiConversation[]>(MOCK_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const threadScrollRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeConversationId
  );

  useEffect(() => {
    const container = threadScrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [activeConversation?.messages.length]);

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setInputValue("");
  };

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: ChatMessage = {
      id: nextMessageId(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const { reply, resources, tips } = getCannedReply(trimmed);
    const assistantMessage: ChatMessage = {
      id: nextMessageId(),
      role: "assistant",
      content: reply,
      createdAt: new Date().toISOString(),
    };

    if (activeConversation) {
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === activeConversation.id
            ? {
                ...conversation,
                messages: [...conversation.messages, userMessage, assistantMessage],
                resources,
                tips,
              }
            : conversation
        )
      );
    } else {
      const newConversation: AiConversation = {
        id: `conv-${Date.now()}`,
        title: trimmed.length > 40 ? `${trimmed.slice(0, 40)}...` : trimmed,
        createdAt: new Date().toISOString(),
        messages: [userMessage, assistantMessage],
        resources,
        tips,
      };
      setConversations((current) => [newConversation, ...current]);
      setActiveConversationId(newConversation.id);
    }

    setInputValue("");
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
      <AiChatSidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewConversation={handleNewConversation}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <Heading as="h5" className="text-gray-900">
            {activeConversation?.title ?? "Chat con IA"}
          </Heading>
        </div>

        {activeConversation ? (
          <div className="flex flex-1 overflow-hidden">
            <div ref={threadScrollRef} className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-5">
                {activeConversation.messages.map((message) => (
                  <AiChatMessageBubble key={message.id} message={message} />
                ))}
              </div>
            </div>

            {activeConversation.resources.length > 0 || activeConversation.tips.length > 0 ? (
              <div className="w-80 shrink-0 space-y-4 overflow-y-auto border-l border-gray-200 bg-white p-4">
                <AiChatResourcesPanel resources={activeConversation.resources} />
                <AiChatTipsPanel tips={activeConversation.tips} />
              </div>
            ) : null}
          </div>
        ) : (
          <AiChatWelcome onPromptSelect={sendMessage} />
        )}

        <AiChatInputBar
          value={inputValue}
          onChange={setInputValue}
          onSend={() => {
            sendMessage(inputValue);
          }}
        />
      </div>
    </div>
  );
}
