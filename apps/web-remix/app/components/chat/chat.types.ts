export type MessageRole = 'ai' | 'user';
export interface IMessage {
  id: string;
  role: MessageRole;
  message: string;
  created_at: Date;
}

export type ChatSize = 'sm' | 'md';
