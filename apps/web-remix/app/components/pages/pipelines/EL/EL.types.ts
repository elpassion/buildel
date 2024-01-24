export type MessageStatusType = "finished" | "ongoing";
export type MessageType = "ai" | "user";
export interface IMessage {
  id: string;
  type: MessageType;
  message: string;
  created_at: Date;
  status: MessageStatusType;
}
