import { z } from "zod";

export class MessageService {
  constructor(private readonly message: IMessage) {}
}

const SystemMessage = z.object({
  role: z.literal("system"),
  content: z.string(),
});

const UserMessage = z.object({
  role: z.literal("user"),
  content: z.string(),
});

const AssistantMessage = z.object({
  role: z.literal("assistant"),
  content: z.string(),
});

export const Message = z.union([SystemMessage, UserMessage, AssistantMessage]);

export type IMessage = z.infer<typeof Message>;
