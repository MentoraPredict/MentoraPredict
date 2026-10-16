export type ChatMessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
}

export interface ChatResource {
  id: string;
  title: string;
  description: string;
}

export interface ChatTip {
  id: string;
  text: string;
}

export interface AiConversation {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
  resources: ChatResource[];
  tips: ChatTip[];
}
